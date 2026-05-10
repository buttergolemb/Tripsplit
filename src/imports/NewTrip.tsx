import svgPaths from "./svg-2e83rt0p1r";

function Container() {
  return <div className="bg-[#e5e5ea] h-[4.992px] rounded-[27417100px] shrink-0 w-[35.99px]" data-name="Container" />;
}

function Container2() {
  return (
    <div className="h-[48.987px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.992px] h-full items-start not-italic relative whitespace-nowrap">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27.5px] relative shrink-0 text-[#1c1c1e] text-[20px]">Add Activity</p>
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] relative shrink-0 text-[#8e8e93] text-[13px]">Adding to Day 1 · Mar 15</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[15.997px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9972 15.9972">
        <g id="Icon">
          <path d={svgPaths.p39a8f620} id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3331" />
          <path d={svgPaths.pb771080} id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3331" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#f1f2f5] relative rounded-[27417100px] shrink-0 size-[31.994px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[7.992px] pr-[8.005px] relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex h-[48.987px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <Button />
    </div>
  );
}

function Title() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full" data-name="Title">
      <Container />
      <Container1 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[18.002px] relative shrink-0 w-[353.853px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18px] left-0 not-italic text-[#8e8e93] text-[12px] top-[0.63px] tracking-[0.6px] uppercase whitespace-nowrap">Suggested activities</p>
    </div>
  );
}

function CategorySelection() {
  return (
    <div className="content-stretch flex gap-[8px] items-center not-italic relative shrink-0 text-center w-full whitespace-nowrap" data-name="Category Selection">
      <div className="bg-[#f7f7f5] content-stretch flex flex-col gap-[3.996px] h-[60px] items-center justify-center relative rounded-[12px] shrink-0 w-[56px]" data-name="Category Button">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">🍽</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Food</p>
      </div>
      <div className="bg-[#f7f7f5] content-stretch flex flex-col gap-[3.996px] h-[60px] items-center justify-center relative rounded-[12px] shrink-0 w-[56px]" data-name="Category Button">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">🌲</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Outdoors</p>
      </div>
      <div className="bg-[#f7f7f5] content-stretch flex flex-col gap-[3.996px] h-[60px] items-center justify-center relative rounded-[12px] shrink-0 w-[56px]" data-name="Category Button">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">🎸</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Music</p>
      </div>
      <div className="bg-[#f7f7f5] content-stretch flex flex-col gap-[3.996px] h-[60px] items-center justify-center relative rounded-[12px] shrink-0 w-[56px]" data-name="Category Button">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">🛍️</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Shopping</p>
      </div>
      <div className="bg-[#f7f7f5] content-stretch flex flex-col gap-[3.996px] h-[60px] items-center justify-center relative rounded-[12px] shrink-0 w-[56px]" data-name="Category Button">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">🍺</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Drinks</p>
      </div>
      <div className="bg-[#f7f7f5] content-stretch flex flex-col gap-[3.996px] h-[60px] items-center justify-center relative rounded-[12px] shrink-0 w-[56px]" data-name="Category Button">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">🎟️</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Other</p>
      </div>
    </div>
  );
}

function Category() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip relative shrink-0 w-full" data-name="Category">
      <Paragraph />
      <CategorySelection />
    </div>
  );
}

function Label() {
  return (
    <div className="h-[18.002px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18px] left-0 not-italic text-[#8e8e93] text-[12px] top-[0.63px] tracking-[0.6px] uppercase whitespace-nowrap">Category Name</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#f7f7f5] relative rounded-[14px] shrink-0 size-[47.988px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[28px] not-italic relative shrink-0 text-[#ccccd0] text-[20px] text-center whitespace-nowrap">+</p>
      </div>
    </div>
  );
}

function TextInput() {
  return (
    <div className="bg-[#f7f7f5] flex-[287.872_0_0] h-[46.459px] min-h-px min-w-px relative rounded-[14px] shadow-[0px_0px_0px_0.383px_rgba(0,122,255,0.04)]" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[16px] py-[12px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#c7c7cc] text-[15px] whitespace-nowrap">Dinner at Franklin BBQ</p>
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[9.997px] h-[47.992px] items-center relative shrink-0 w-full" data-name="Container">
      <Button1 />
      <TextInput />
    </div>
  );
}

function SlotTesting() {
  return (
    <div className="content-stretch flex flex-col gap-[7.992px] items-start relative shrink-0 w-[345.861px]" data-name="slot testing">
      <Label />
      <Container3 />
    </div>
  );
}

function Label1() {
  return (
    <div className="h-[18.002px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18px] left-0 not-italic text-[#8e8e93] text-[12px] top-[0.63px] tracking-[0.6px] uppercase whitespace-nowrap">Suggested time</p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[15.984px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9836 15.9836">
        <g clipPath="url(#clip0_2088_122)" id="Icon">
          <path d={svgPaths.p2905dd00} id="Vector" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33197" />
          <path d={svgPaths.pf341500} id="Vector_2" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33197" />
        </g>
        <defs>
          <clipPath id="clip0_2088_122">
            <rect fill="white" height="15.9836" width="15.9836" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function TextInput1() {
  return (
    <div className="bg-[#f7f7f5] flex-[287.872_0_0] h-[46.459px] min-h-px min-w-px relative rounded-[14px] shadow-[0px_0px_0px_0.383px_rgba(0,122,255,0.04)]" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center px-[16px] py-[12px] relative size-full">
          <Icon1 />
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#c7c7cc] text-[15px] whitespace-nowrap">--:-- PM</p>
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex h-[47.992px] items-center relative shrink-0 w-full" data-name="Container">
      <TextInput1 />
    </div>
  );
}

function SlotTesting1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[73.985px] items-start relative shrink-0 w-[345.861px]" data-name="slot testing">
      <Label1 />
      <Container4 />
    </div>
  );
}

function Label2() {
  return (
    <div className="h-[18.002px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18px] left-0 not-italic text-[#8e8e93] text-[12px] top-[0.63px] tracking-[0.6px] uppercase whitespace-nowrap">LOcation</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[15.984px] relative shrink-0 w-[14.984px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9836 15.9836">
        <g clipPath="url(#clip0_2088_105)" id="Icon">
          <path d={svgPaths.p13277100} id="Vector" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33197" />
          <path d={svgPaths.p2a9da80} id="Vector_2" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33197" />
        </g>
        <defs>
          <clipPath id="clip0_2088_105">
            <rect fill="white" height="15.9836" width="14.9836" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[15.984px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9836 15.9836">
        <g id="Icon">
          <path d={svgPaths.p2371fd00} id="Vector" stroke="var(--stroke-0, #D1D1D6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33197" />
          <path d={svgPaths.p25535400} id="Vector_2" stroke="var(--stroke-0, #D1D1D6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33197" />
        </g>
      </svg>
    </div>
  );
}

function TextInput2() {
  return (
    <div className="bg-[#f7f7f5] flex-[287.872_0_0] h-[46.459px] min-h-px min-w-px relative rounded-[14px] shadow-[0px_0px_0px_0.383px_rgba(0,122,255,0.04)]" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center px-[16px] py-[12px] relative size-full">
          <Icon2 />
          <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-h-px min-w-px not-italic relative text-[#c7c7cc] text-[15px]">Search for a place</p>
          <Icon3 />
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex h-[47.992px] items-center relative shrink-0 w-full" data-name="Container">
      <TextInput2 />
    </div>
  );
}

function SlotTesting2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[73.985px] items-start relative shrink-0 w-[345.861px]" data-name="slot testing">
      <Label2 />
      <Container5 />
    </div>
  );
}

function Label3() {
  return (
    <div className="h-[18.007px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18px] left-0 not-italic text-[#8e8e93] text-[12px] top-[0.1px] tracking-[0.6px] uppercase whitespace-nowrap">Notes (optional)</p>
    </div>
  );
}

function TextArea() {
  return (
    <div className="absolute bg-[#f7f7f5] content-stretch flex h-[99.983px] items-start left-0 overflow-clip pl-[44px] pr-[16px] py-[12px] rounded-[12px] top-0 w-[352.943px]" data-name="Text Area">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22.5px] not-italic relative shrink-0 text-[#c7c7cc] text-[15px] whitespace-nowrap">{`Any details? e.g. 'Need to book ahead'`}</p>
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[15.98px] size-[15.984px] top-[15.98px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9836 15.9836">
        <g id="Icon">
          <path d="M9.98977 7.99182H1.99795" id="Vector" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33197" />
          <path d="M11.3217 11.9877H1.99795" id="Vector_2" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33197" />
          <path d="M13.9857 3.99591H1.99795" id="Vector_3" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33197" />
        </g>
      </svg>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[107.512px] relative shrink-0 w-full" data-name="Container">
      <TextArea />
      <Icon4 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col gap-[9.998px] h-[135.518px] items-start relative shrink-0 w-full" data-name="Container">
      <Label3 />
      <Container7 />
    </div>
  );
}

function Cta() {
  return (
    <div className="bg-[#007aff] h-[53.494px] opacity-40 relative rounded-[14px] shrink-0 w-full" data-name="CTA">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[25.5px] left-[173.3px] not-italic text-[17px] text-center text-white top-[14.44px] whitespace-nowrap">Add Activity</p>
    </div>
  );
}

export default function NewTrip() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] items-center p-[24px] relative rounded-tl-[28px] rounded-tr-[28px] shadow-[0px_20px_40px_0px_rgba(0,0,0,0.12)] size-full" data-name="New Trip">
      <Title />
      <Category />
      <SlotTesting />
      <SlotTesting1 />
      <SlotTesting2 />
      <Container6 />
      <Cta />
    </div>
  );
}