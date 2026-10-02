'use client';

import { useFormStatus } from 'react-dom';

type Props = {
  texto: string;
  textoEnviando: string;
  className?: string;
  disabled?: boolean;
};

// Botón de envío que sabe solo si su <form> está ejecutando la action (useFormStatus)
export default function BotonEnviar({ texto, textoEnviando, className, disabled }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled}>
      {pending ? textoEnviando : texto}
    </button>
  );
}
