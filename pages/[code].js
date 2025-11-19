import prisma from "../lib/prisma";

// Redirect handler: /:code → redirect to target URL
export async function getServerSideProps({ params }) {
  const code = params.code;

  const link = await prisma.link.findUnique({
    where: { code },
  });

  if (!link) {
    return {
      notFound: true,
    };
  }

  // Update click count + lastClicked
  await prisma.link.update({
    where: { code },
    data: {
      clicks: link.clicks + 1,
      lastClicked: new Date(),
    },
  });

  return {
    redirect: {
      destination: link.target,
      permanent: false,
    },
  };
}

export default function RedirectPage() {
  return null; // never rendered — redirect happens on server
}
