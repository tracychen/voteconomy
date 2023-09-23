import { getProposal } from "../../../../services/proposals";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const idNumber = Number(id);
    console.log("Getting proposal with ID: " + idNumber);
    const proposal = await getProposal(idNumber);
    return new Response(
      JSON.stringify({
        proposal,
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error,
      }),
      { status: 500 }
    );
  }
}
