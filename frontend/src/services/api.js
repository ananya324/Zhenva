import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

export async function checkText(text,language){
    const {data} = await api.post("/check/text",{text,language});
    return data;
}

export async function checkImage(file,language){
    const form = new FormData();
    form.append("image",file);
    form.append("language",language);
    const {data} = await api.post("/check/image",form);
    return data;
}

export async function checkVideo(url,language){
    const {data} = await api.post("/check/video",{url,language});
    return data;
}


// ─── Poll job status ──────────────────────────────────────────────────────────
export async function getJobStatus(jobId) {
  const { data } = await api.get(`/check/video/job/${jobId}`);
  return data;
}
