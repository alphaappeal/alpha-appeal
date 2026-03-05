import React, { forwardRef } from "react";
import { Helmet } from "react-helmet-async";
import BottomNav from "@/components/BottomNav";
import AlphaMap from "@/components/AlphaMap";

const Map = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <>
      <Helmet>
        <title>Map | Alpha</title>
        <meta name="description" content="Find Alpha Appeal locations across South Africa." />
      </Helmet>

      <div ref={ref} className="h-screen w-full bg-background">
        <AlphaMap />
        <BottomNav />
      </div>
    </>
  );
});
Map.displayName = "Map";

export default Map;
