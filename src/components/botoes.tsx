"use client";

import { Button, type ButtonProps } from "@chakra-ui/react";

export function BotaoPrimario({ className = "", ...props }: ButtonProps) {
  return <Button unstyled className={`btn-red ${className}`} {...props} />;
}

export function BotaoSecundario({ className = "", ...props }: ButtonProps) {
  return <Button unstyled className={`btn-neo ${className}`} {...props} />;
}

export function BotaoQuieto({ className = "", ...props }: ButtonProps) {
  return <Button unstyled className={`btn-quiet ${className}`} {...props} />;
}
