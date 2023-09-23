import { NextRequest } from "next/server";
import { submiteVote } from "../../../../../services/votes";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { voteType } = await req.json();
    const idNumber = Number(params.id);
    const hash = await submiteVote(idNumber, voteType);
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
