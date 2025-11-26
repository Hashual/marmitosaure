import Header from "../components/Header";
import RecipeEditor from "../components/RecipeEditor";

export default function RecipeCreatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <RecipeEditor />
    </div>
  );
}
