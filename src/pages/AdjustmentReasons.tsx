import Layout from "../components/Layout";
import AdjustmentReasonsTab from "@/components/settings/AdjustmentReasonsTab";

const AdjustmentReasons = () => {
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Adjustment Reasons</h1>
        </div>
        <AdjustmentReasonsTab />
      </div>
    </Layout>
  );
};

export default AdjustmentReasons;