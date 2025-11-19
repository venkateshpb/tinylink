export async function getServerSideProps({ res }) {
  const body = JSON.stringify({ ok: true, version: "1.0" });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.statusCode = 200;
  res.end(body);

  return { props: {} };
}

export default function Healthz() {
  return null;
}
