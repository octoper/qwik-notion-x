import { component$ } from "@builder.io/qwik";
import CheckIcon from "../icons/check";

export const Checkbox = component$<{
  isChecked: boolean;
  blockId: string | undefined;
}>(({ isChecked }) => {
  let content = null;

  if (isChecked) {
    content = (
      <div class="notion-property-checkbox-checked">
        <CheckIcon />
      </div>
    );
  } else {
    content = <div class="notion-property-checkbox-unchecked" />;
  }

  return (
    <span class="notion-property notion-property-checkbox">{content}</span>
  );
});
