import { SendBody } from ".";

export function sendViaForm(url: string, body: SendBody): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;
      form.style.display = "none";

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "d";
      input.value = body.base64;
      form.appendChild(input);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      resolve(true);
    } catch {
      resolve(false);
    }
  });
}
