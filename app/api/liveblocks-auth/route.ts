 
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { auth, currentUser } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocks = new Liveblocks({
  secret: "sk_dev_i4W2fmsC7jUcRN2quiERfhzl2rZUrGMxv3MjLw0mHCHUAnmGZUesaJ92kaRCcZ6E",
});



export async function POST(request: Request) {
  /**
   * If an unauthenticated user tries to access a room, we return a Unauthorized 403 response
   */
  const authorization = auth();
  const user = await currentUser();

//   console.log("auth info",{
//     authorization,
//     user,
//   }); 

  if (!authorization || !user) {
    return new Response("Unauthorized", {
      status: 403,
    });
  }

  const { room } = await request.json();
  const board = await convex.query(api.board.get, {
    id: room,
  });

  //  console.log("auth info",{
  //   room,
  //   board,
  //   boardorgid : board?.orgId,
  //   userorgid : (await authorization).orgId,    

  //  });


//   console.log("general info",{
//     authorization,
//     board,
//   }); 

// console.log("authorization.orgId", authorization);

 

// TODO : I HAVE TO FIX THIS AUTHROISTION PART 

  
  if (board?.orgId !== (await authorization).orgId) {
    return new Response("Unauthorized", { status: 403 });
  }
// if(!board?.orgId) {
//     return new Response("Unauthorized", { status: 403 });
// }
  const userInfo = {
    name: user.firstName || "Teammate",
    picture: user.imageUrl,
  };


//    console.log("user information",{userInfo}) ;

  const session = liveblocks.prepareSession(user.id, { userInfo });
  if (room) {
    session.allow(room, session.FULL_ACCESS);

  }

  

  const { status, body } = await session.authorize();
//   console.log( {status, body} ,"allowed");

  return new Response(body, {
    status,
  });
}