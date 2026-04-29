export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400 }
      )
    }

    console.log("INTEREST EMAIL:", email)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400 }
    )
  }
}
