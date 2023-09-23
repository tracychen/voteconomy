import { NextRequest } from "next/server";
import { createProposal, getProposals } from "../../../services/proposals";

export async function GET(_: NextRequest) {
  try {
    const proposals = await getProposals();
    return new Response(
      JSON.stringify({
        proposals,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;
    console.log(name);
    const hash = await createProposal(name, description);
    return new Response(
      JSON.stringify({
        hash,
      }),
      { status: 201 }
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
