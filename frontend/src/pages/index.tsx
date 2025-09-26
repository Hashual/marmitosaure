import { Link } from "react-router";

export default function Home() {
  return (
    <div>
      <div>hello world</div>
      <Link to="/about">about</Link>
    </div>
  );
}
