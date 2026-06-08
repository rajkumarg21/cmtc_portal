import React, { useEffect, useRef } from "react";

export default function RedirectToUniPayForm({ actionUrl, encRequest, serviceKey }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.submit(); }, []);

  return (
    <form ref={ref} action={actionUrl} method="POST">
      <input type="hidden" name="EncRequest" value={encRequest} />
      <input type="hidden" name="ServiceKey" value={serviceKey} />
      <noscript><button type="submit">Continue</button></noscript>
    </form>
  );
}
