'use client'

import { useEffect } from "react";
import { KonvaCanvas } from "../../components/konva-canvas";
import io from "socket.io-client"

const socket = io("http://localhost:3001")

export default function Home() {

  return (
    <div>
      <KonvaCanvas socket={socket}/>
    </div>
  );
}
