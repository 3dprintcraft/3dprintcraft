export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/api/card") {
      const cardId = url.searchParams.get("card");

      if (!cardId) {
        return new Response(
          JSON.stringify({ error: "No card id" }),
          { status: 400 }
        );
      }

      return new Response(
        JSON.stringify({
          card_id: cardId,
          coffees: 3,
          max: 6
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    return new Response("Not Found", { status: 404 });
  }
};
