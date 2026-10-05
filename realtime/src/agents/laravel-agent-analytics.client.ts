import { Injectable } from "@nestjs/common";

@Injectable()
export class LaravelAgentAnalyticsClient {
  async log(agentId:string, payload:{
    request_id?:string;
    session_id?:number;
    question:string;
    answer?:string;
    status:string;
    duration_ms?:number;
  }):Promise<void>{
    const base=(process.env.LARAVEL_API_URL??"http://backend-nginx/api/v1").replace(/\/$/,"");
    const secret=String(process.env.AGENT_SHARED_SECRET??"").trim();

    await fetch(`${base}/internal/agents/${encodeURIComponent(agentId)}/interactions`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "X-Agent-Shared-Secret":secret,
      },
      body:JSON.stringify(payload),
    }).catch(()=>undefined);
  }
}
