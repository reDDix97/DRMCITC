import React, { useMemo, useState } from 'react';
import { generateQrMatrix } from '../utils/qr';

interface QrCodeSvgProps {
  payload: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({
  payload,
  size = 160,
  className = '',
  darkColor = '#09090b',
  lightColor = '#ffffff',
}) => {
  const matrix = useMemo(() => generateQrMatrix(payload), [payload]);
  const gridCount = matrix.length;
  const quietZone = 2;
  const totalUnits = gridCount + quietZone * 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${totalUnits} ${totalUnits}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`QR Code for ${payload}`}
    >
      <rect width={totalUnits} height={totalUnits} rx="1.5" fill={lightColor} />
      {matrix.map((row, rIdx) =>
        row.map((cell, cIdx) =>
          cell ? (
            <rect
              key={`${rIdx}-${cIdx}`}
              x={cIdx + quietZone}
              y={rIdx + quietZone}
              width={1}
              height={1}
              fill={darkColor}
              shapeRendering="crispEdges"
            />
          ) : null
        )
      )}
    </svg>
  );
};

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-zinc-300 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="font-display text-sm font-semibold tracking-tight text-white">
          {fallbackLabel || alt}
        </span>
        <span className="mt-1 text-xs text-zinc-400">DRMC IT Club · NEXUS</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
    />
  );
};
