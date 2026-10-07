"use client";

import { ChakraProvider } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { sistema } from "@/theme";

export function Provedor({ children }: { children: ReactNode }) {
  return <ChakraProvider value={sistema}>{children}</ChakraProvider>;
}
