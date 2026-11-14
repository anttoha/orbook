import { Component } from "react";
import { translate } from "../../shared/i18n/translate";

// Ошибка внутри одного блока не ломает соседей и весь «Start»: вместо блока — короткая строка.
// Границы ошибок в React бывают только классами
class BlockBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="grid h-full place-items-center rounded-card bg-card p-3.5 text-center text-body-sm font-semibold text-faint">
        {translate("Block konnte nicht geladen werden")}
      </div>
    );
  }
}

export default BlockBoundary;
