// Update this page (the content is just a fallback if you fail to update the page)

import Navigation from "../components/Navigation";
import Dashboard from "../components/Dashboard";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 ml-64">
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
