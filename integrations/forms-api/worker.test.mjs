import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.mjs";

const HC = "https://www.hello-casa.com";
const CC = "https://www.confidentcleanings.com";
const BASE_ENV = {
  AIRTABLE_PAT: "test-only-token",
  AIRTABLE_BASE_ID: "appgT3oQS3MTiQtUV",
  AIRTABLE_TABLE_ID: "tblCVGPxKGKCG4XDI",
  TURNSTILE_SECRET: "test-turnstile",
  CONTACT_MODE: "test",
};
const valid = {
  name: "Sample Guest", email: "guest@example.com", phone: "5551234567",
  topic: "I have a question", message: "Synthetic message for a local unit test.",
  replyConsent: true, website: "", turnstileToken: "dummy-token",
};
const request = (value=valid,origin=HC) => new Request("https://forms.example/api/contact", {
  method: "POST", headers: { Origin: origin, "Content-Type": "application/json" },
  body: JSON.stringify(value),
});

test("rejects an unapproved website before any fetch", async () => {
  const previous = globalThis.fetch;
  let fetched=false;
  globalThis.fetch=async()=>{fetched=true;throw new Error("unexpected");};
  try {
    const response=await worker.fetch(request(valid,"https://unauthorized.example"),BASE_ENV);
    assert.equal(response.status,403);
    assert.equal(fetched,false);
  } finally {globalThis.fetch=previous;}
});

test("requires all Atlas fields and approved topics", async () => {
  const previous = globalThis.fetch;
  globalThis.fetch=async()=>{throw new Error("unexpected fetch");};
  try {
    for(const bad of [
      {...valid,email:"bad"}, {...valid,email:""}, {...valid,phone:"short"},
      {...valid,topic:"Existing booking help"}, {...valid,message:""},
      {...valid,replyConsent:false},
    ]){
      const response=await worker.fetch(request(bad),BASE_ENV);
      assert.equal(response.status,422,JSON.stringify(bad));
    }
  } finally {globalThis.fetch=previous;}
});

test("stores Hello Casa Lead and sends no Telegram alert before group setup", async () => {
  const previous=globalThis.fetch;
  const calls=[];
  globalThis.fetch=async(url,opts)=>{
    calls.push({url:String(url),opts});
    if(String(url).includes("/siteverify"))return new Response(
      JSON.stringify({success:true,hostname:"www.hello-casa.com"}),{status:200}
    );
    return new Response(JSON.stringify({id:"recSynthetic00001"}),{status:200});
  };
  try {
    const response=await worker.fetch(request(),BASE_ENV);
    assert.equal(response.status,201);
    assert.equal(calls.length,2);
    const fields=JSON.parse(calls[1].opts.body).fields;
    assert.equal(fields.fldplRnoZciBVRIWY,"Hello Casa");
    assert.equal(fields.fldrRV6y8pfL73o74,"Test");
    assert.equal(fields.fldVAtEsUjUwVibjN,valid.email);
    assert.equal(fields.fldEV99earNSeBe61,valid.phone);
    assert.equal(fields.fldgETeUwvPLui35l,undefined);
    assert.match(fields.fldfir37pNdk9A3jJ,/I have a question/);
  } finally {globalThis.fetch=previous;}
});

test("notifies a single private Telegram group only after a successful CC Lead write", async () => {
  const previous=globalThis.fetch;
  const calls=[],pending=[];
  const env={...BASE_ENV,TELEGRAM_BOT_TOKEN:"fake-token",TELEGRAM_CHAT_ID:"-1001234567890"};
  globalThis.fetch=async(url,opts)=>{
    const u=String(url);
    calls.push({url:u,opts});
    if(u.includes("/siteverify"))return new Response(
      JSON.stringify({success:true,hostname:"www.confidentcleanings.com"}),{status:200}
    );
    if(u.includes("api.airtable.com"))return new Response(
      JSON.stringify({id:"recSynthetic00001"}),{status:200}
    );
    if(u.includes("/sendMessage"))return new Response(
      JSON.stringify({ok:true,result:{message_id:1}}),{status:200}
    );
    throw new Error("Unexpected URL");
  };
  try {
    const response=await worker.fetch(request(valid,CC),env,{waitUntil(p){pending.push(p);}});
    assert.equal(response.status,201);
    assert.equal(pending.length,1);
    await Promise.all(pending);
    assert.equal(calls.length,3);
    const lead=JSON.parse(calls[1].opts.body).fields;
    assert.equal(lead.fldplRnoZciBVRIWY,"Confident Cleanings");
    const alert=JSON.parse(calls[2].opts.body);
    assert.equal(alert.chat_id,env.TELEGRAM_CHAT_ID);
    assert.match(alert.text,/Confident Cleanings/);
    assert.match(alert.text,/California/);
    assert.match(alert.text,/I have a question/);
    assert.doesNotMatch(alert.text,/guest@example.com|5551234567|Synthetic message/);
    assert.match(alert.reply_markup.inline_keyboard[0][0].url,/recSynthetic00001/);
  } finally {globalThis.fetch=previous;}
});

test("no alert when Airtable fails", async () => {
  const previous=globalThis.fetch;
  const calls=[];
  globalThis.fetch=async(url)=>{
    const u=String(url);calls.push(u);
    if(u.includes("/siteverify"))return new Response(
      JSON.stringify({success:true,hostname:"www.hello-casa.com"}),{status:200}
    );
    return new Response("{}",{status:503});
  };
  try {
    const response=await worker.fetch(request(),{...BASE_ENV,TELEGRAM_BOT_TOKEN:"fake",TELEGRAM_CHAT_ID:"-1001234567890"});
    assert.equal(response.status,502);
    assert.equal(calls.length,2);
  } finally {globalThis.fetch=previous;}
});

test("OPTIONS preflight works for both approved origins", async () => {
  for(const origin of [HC,CC]){
    const response=await worker.fetch(new Request("https://forms.example/api/contact",{
      method:"OPTIONS",headers:{Origin:origin}
    }),BASE_ENV);
    assert.equal(response.status,200);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"),origin);
  }
});

test("requires Airtable authorization before external calls", async () => {
  const response=await worker.fetch(request(),{...BASE_ENV,AIRTABLE_PAT:""});
  assert.equal(response.status,503);
});
