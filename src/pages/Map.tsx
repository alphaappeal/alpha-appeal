import { Helmet } from "react-helmet-async";
import BottomNav from "@/components/BottomNav";
import AlphaMap from "@/components/AlphaMap";

const Map = () => {
  return (
    <>
      <Helmet>
        <title>Map | Alpha</title>
        <meta name="description" content="Find Alpha Appeal locations across South Africa." />
      </Helmet>

      <div className="min-h-screen bg-background pb-20">
        <AlphaMap />
        <BottomNav />
      </div>
    </>
  );
};

export default Map;
