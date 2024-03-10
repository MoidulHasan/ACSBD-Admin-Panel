import { joinURL } from "ufo";

export default defineEventHandler((event) => {
  const proxyUrl = useRuntimeConfig().apiBase;

  const path = event.path.replace("proxy/", "");

  const target = joinURL(proxyUrl, path);

  return proxyRequest(event, target);
});
