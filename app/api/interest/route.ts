export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, consent } = body

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
    }

    console.log("INTEREST:", { email, consent })

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
  }
}
