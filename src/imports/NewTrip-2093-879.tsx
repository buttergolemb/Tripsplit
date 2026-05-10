import svgPaths from "./svg-w5z9pj2i8w";

function Container() {
  return <div className="bg-[#e5e5ea] h-[4.992px] rounded-[27417100px] shrink-0 w-[35.99px]" data-name="Container" />;
}

function Container2() {
  return (
    <div className="h-[48.987px] relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.992px] items-start not-italic relative size-full whitespace-nowrap">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[27.5px] relative shrink-0 text-[#1c1c1e] text-[20px]">Add Expense</p>
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] relative shrink-0 text-[#8e8e93] text-[13px]">Log spending for this trip</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[15.997px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9972 15.9972">
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
    <div className="h-[18.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18px] left-0 not-italic text-[#8e8e93] text-[12px] top-[0.63px] tracking-[0.6px] uppercase whitespace-nowrap">Amount</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[31.994px] relative shrink-0 w-[37.267px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex font-['Inter:Semi_Bold',sans-serif] font-semibold gap-[4px] items-center not-italic relative size-full">
        <div className="flex flex-col h-full justify-center leading-[0] relative shrink-0 text-[#c7c7cc] text-[18px] w-[11.669px]">
          <p className="leading-[27px]">$</p>
        </div>
        <p className="h-full leading-[32px] relative shrink-0 text-[#d1d1d6] text-[32px] tracking-[-0.8px] w-[19.61px]">0</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[3.996px] items-center justify-end relative shrink-0 w-full" data-name="Container">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] not-italic relative shrink-0 text-[#007aff] text-[13px] text-right whitespace-nowrap">You</p>
      <div className="h-[2.997px] relative shrink-0 w-[5.994px]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.99318 3.9961">
            <path d={svgPaths.p18e7e400} id="Vector" stroke="var(--stroke-0, #007AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999025" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="relative shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[15px] not-italic relative shrink-0 text-[#8e8e93] text-[10px] text-right whitespace-nowrap">Paid by</p>
        <Container5 />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#f7f7f5] relative rounded-[14px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[0.817px] border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16.814px] py-[8.817px] relative size-full">
          <Container4 />
          <Button2 />
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Paragraph />
      <Button1 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[18.002px] relative shrink-0 w-[353.853px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18px] left-0 not-italic text-[#8e8e93] text-[12px] top-[0.63px] tracking-[0.6px] uppercase whitespace-nowrap">Category</p>
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
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">⛽</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Gas</p>
      </div>
      <div className="bg-[#f7f7f5] content-stretch flex flex-col gap-[3.996px] h-[60px] items-center justify-center relative rounded-[12px] shrink-0 w-[56px]" data-name="Category Button">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">🏠</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Lodging</p>
      </div>
      <div className="bg-[#f7f7f5] content-stretch flex flex-col gap-[3.996px] h-[60px] items-center justify-center relative rounded-[12px] shrink-0 w-[56px]" data-name="Category Button">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">🎟️</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Fun</p>
      </div>
      <div className="bg-[#f7f7f5] content-stretch flex flex-col gap-[3.996px] h-[60px] items-center justify-center relative rounded-[12px] shrink-0 w-[56px]" data-name="Category Button">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">🍺</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Drinks</p>
      </div>
      <div className="bg-[#f7f7f5] content-stretch flex flex-col gap-[3.996px] h-[60px] items-center justify-center relative rounded-[12px] shrink-0 w-[56px]" data-name="Category Button">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">🛍️</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Shopping</p>
      </div>
      <div className="bg-[#f7f7f5] content-stretch flex flex-col gap-[3.996px] h-[60px] items-center justify-center relative rounded-[12px] shrink-0 w-[56px]" data-name="Category Button">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">🛒</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Groceries</p>
      </div>
      <div className="bg-[#f7f7f5] content-stretch flex flex-col gap-[3.996px] h-[60px] items-center justify-center relative rounded-[12px] shrink-0 w-[56px]" data-name="Category Button">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#1c1c1e] text-[20px]">💸</p>
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] overflow-hidden relative shrink-0 text-[#8e8e93] text-[10px] text-ellipsis">Other</p>
      </div>
    </div>
  );
}

function Category() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Category">
      <Paragraph1 />
      <CategorySelection />
    </div>
  );
}

function Label() {
  return (
    <div className="h-[18.002px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18px] left-0 not-italic text-[#8e8e93] text-[12px] top-[0.63px] tracking-[0.6px] uppercase whitespace-nowrap">Description</p>
    </div>
  );
}

function TextInput() {
  return (
    <div className="bg-[#f7f7f5] flex-[287.872_0_0] h-[46.459px] min-w-px relative rounded-[14px] shadow-[0px_0px_0px_0.383px_rgba(0,122,255,0.04)]" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center px-[16px] py-[12px] relative size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#c7c7cc] text-[15px] whitespace-nowrap">What was this for?</p>
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex h-[47.992px] items-center relative shrink-0 w-full" data-name="Container">
      <TextInput />
    </div>
  );
}

function SlotTesting() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[73.985px] items-start relative shrink-0 w-[345.861px]" data-name="slot testing">
      <Label />
      <Container6 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[15.997px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9972 15.9972">
        <g clipPath="url(#clip0_2093_969)" id="Icon">
          <path d={svgPaths.p30a7fb00} id="Vector" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3331" />
          <path d={svgPaths.p21d50b80} id="Vector_2" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3331" />
        </g>
        <defs>
          <clipPath id="clip0_2093_969">
            <rect fill="white" height="15.9972" width="15.9972" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[19.495px] relative shrink-0 w-[99.098px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#8e8e93] text-[13px] top-[0.63px] whitespace-nowrap">Now · Fri Mar 18</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="bg-[#f7f7f5] flex-[172.93_0_0] h-[43.472px] min-w-px relative rounded-[14px]" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.992px] items-center pl-[13.993px] relative size-full">
          <Icon1 />
          <Text />
        </div>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[15.997px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9972 15.9972">
        <g clipPath="url(#clip0_2093_963)" id="Icon">
          <path d={svgPaths.p3a1b6dc0} id="Vector" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3331" />
          <path d={svgPaths.p34c51f80} id="Vector_2" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3331" />
          <path d={svgPaths.p58e8380} id="Vector_3" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3331" />
          <path d={svgPaths.pdebe0c0} id="Vector_4" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3331" />
        </g>
        <defs>
          <clipPath id="clip0_2093_963">
            <rect fill="white" height="15.9972" width="15.9972" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[19.495px] relative shrink-0 w-[95.983px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-[48.5px] not-italic text-[#8e8e93] text-[13px] text-center top-[0.63px] whitespace-nowrap">Split with group</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#f7f7f5] flex-[172.93_0_0] h-[43.472px] min-w-px relative rounded-[14px]" data-name="Button">
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.992px] items-center pl-[13.993px] relative size-full">
          <Icon2 />
          <Text1 />
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[43.472px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex gap-[7.992px] items-start relative size-full">
        <Container8 />
        <Button3 />
      </div>
    </div>
  );
}

function Cta() {
  return (
    <div className="bg-[#007aff] h-[53.494px] opacity-40 relative rounded-[14px] shrink-0 w-full" data-name="CTA">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[25.5px] left-[173.3px] not-italic text-[17px] text-center text-white top-[14.44px] whitespace-nowrap">Add Category</p>
    </div>
  );
}

export default function NewTrip() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] items-center overflow-clip p-[24px] relative rounded-tl-[28px] rounded-tr-[28px] shadow-[0px_20px_40px_0px_rgba(0,0,0,0.12)] size-full" data-name="New Trip">
      <Title />
      <Container3 />
      <Category />
      <SlotTesting />
      <Container7 />
      <Cta />
    </div>
  );
}