import { Helmet } from "react-helmet-async";
import BottomNav from "@/components/BottomNav";
import AlphaMap from "@/components/AlphaMap";

const Map = () => {
  return (
    <>
      <Helmet>
        <title>Map | Alpha</title>
        <meta name="description" content="Find Alpha Appeal partner locations worldwide." />
      </Helmet>

      <div className="h-screen w-full bg-background">
        <AlphaMap />
        <BottomNav />
      </div>
    </>
  );
};

export default Map;
