import Header from "../components/header";
import RecipeEditor from "../components/RecipeEditor";

export default function RecipeCreatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <RecipeEditor />
    </div>
  );
}
