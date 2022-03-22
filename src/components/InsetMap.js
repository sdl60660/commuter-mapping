import React, { useMemo, useContext } from "react";
import * as d3 from "d3-geo";

import { MapContext } from "../MapContext";

const Inset = ({ visible = true, height = 140, width = 200, states }) => {
  const { center } = useContext(MapContext);

  const padding = 3;

  const top = 0;
  const bottom = top + height;
  const left = 0;
  const right = left + width;

  const projection = useMemo(() => {
    return d3.geoAlbersUsa().fitExtent(
      [
        [left + padding, top + padding],
        [right - padding, bottom - padding],
      ],
      states
    );
  }, [states, bottom, right]);
  const path = useMemo(() => d3.geoPath().projection(projection), [projection]);
  const highlightPoint = useMemo(() => projection(center.toArray()), [center, projection]);

  return (
    <div className="inset-wrapper">
      <svg className="inset-map" style={{ opacity: visible ? 1 : 0, height, width }}>
        <filter id="inset-shadow-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>

        <g id="inset-map">
          {states.features.map((state) => (
            <path
              className="state-shadow"
              d={path(state)}
              fill="rgba(30, 28, 27, 0.6)"
              filter="url(#inset-shadow-blur)"
            />
          ))}
          {states.features.map((state) => (
            <path
              className="state"
              d={path(state)}
              stroke="rgb(30, 28, 27)"
              strokeWidth="0.3"
              fill="rgba(246,246,244,0.95)"
            />
          ))}
          <circle
            className="highlights"
            r="4"
            cx={highlightPoint[0]}
            cy={highlightPoint[1]}
            fill="red"
          />
        </g>
      </svg>
    </div>
  );
};

export default Inset;
