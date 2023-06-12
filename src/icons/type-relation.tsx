import { QwikJSX } from "@builder.io/qwik";

type SVGAttributes = QwikJSX.IntrinsicElements["svg"];

function SvgTypeRelation(props: SVGAttributes) {
  return (
    <svg viewBox='0 0 14 14' {...props}>
      <path d='M4.5 1v2h5.086L1 11.586 2.414 13 11 4.414V9.5h2V1z' />
    </svg>
  )
}

export default SvgTypeRelation
