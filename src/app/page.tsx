import 'bootstrap/dist/css/bootstrap.min.css';
import {Navbar} from './pages/Navbar';
import {Homepage} from './pages/Homepage';
export default function Main() {
  return (
    <div >
      <Navbar></Navbar>
      <Homepage></Homepage>
    </div>
  );
}
