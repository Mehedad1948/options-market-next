import Header from '../components/ui/Header';
import LayoutServerPromises from '../providers/layout-server-promises';

export default function page() {
  return (
    <LayoutServerPromises>
      <Header />
    </LayoutServerPromises>
  );
}
