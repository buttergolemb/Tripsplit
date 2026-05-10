import svgPaths from "./svg-cprbxfjpnl";

function H() {
  return (
    <div className="h-[23.798px] relative shrink-0 w-[64.882px]" data-name="h3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[23.8px] left-0 not-italic text-[#1c1c1e] text-[17px] top-[0.63px] whitespace-nowrap">Balance</p>
      </div>
    </div>
  );
}

function Span() {
  return (
    <div className="h-[18.002px] relative shrink-0 w-[39.169px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[18px] left-0 not-italic text-[#007aff] text-[12px] top-[0.63px] whitespace-nowrap">Details</p>
      </div>
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[13.993px]" data-name="ChevronRight">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9927 13.9927">
        <g id="ChevronRight">
          <path d={svgPaths.p28888800} id="Vector" stroke="var(--stroke-0, #007AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16606" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[18.002px] relative shrink-0 w-[61.154px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.992px] items-center relative size-full">
        <Span />
        <ChevronRight />
      </div>
    </div>
  );
}

function Div() {
  return (
    <div className="content-stretch flex h-[23.798px] items-center justify-between relative shrink-0 w-full" data-name="div">
      <H />
      <Container />
    </div>
  );
}

function P() {
  return (
    <div className="h-[18.002px] relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[18px] left-0 not-italic text-[#8e8e93] text-[12px] top-[0.63px] tracking-[0.3px] uppercase whitespace-nowrap">You are owed</p>
    </div>
  );
}

function Span1() {
  return (
    <div className="h-[41.991px] relative shrink-0 w-[50.698px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[42px] left-0 not-italic text-[#007aff] text-[28px] top-[0.09px] tracking-[-0.7px] whitespace-nowrap">$42</p>
      </div>
    </div>
  );
}

function TrendingUp() {
  return (
    <div className="relative shrink-0 size-[15.997px]" data-name="TrendingUp">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9972 15.9972">
        <g clipPath="url(#clip0_2092_465)" id="TrendingUp">
          <path d={svgPaths.p34f02800} id="Vector" stroke="var(--stroke-0, #007AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3331" />
          <path d={svgPaths.p2b9a0ac0} id="Vector_2" stroke="var(--stroke-0, #007AFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3331" />
        </g>
        <defs>
          <clipPath id="clip0_2092_465">
            <rect fill="white" height="15.9972" width="15.9972" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[7.992px] h-[41.991px] items-center relative shrink-0 w-full" data-name="Container">
      <Span1 />
      <TrendingUp />
    </div>
  );
}

function Container1() {
  return (
    <div className="flex-[1_0_0] h-[63.989px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.996px] items-start relative size-full">
        <P />
        <Container2 />
      </div>
    </div>
  );
}

function P1() {
  return (
    <div className="h-[18.002px] relative shrink-0 w-full" data-name="p">
      <p className="-translate-x-full absolute font-['Inter:Medium',sans-serif] font-medium leading-[18px] left-[72px] not-italic text-[#8e8e93] text-[12px] text-right top-[0.63px] tracking-[0.3px] uppercase whitespace-nowrap">you spent</p>
    </div>
  );
}

function P2() {
  return (
    <div className="h-[25.509px] relative shrink-0 w-full" data-name="p">
      <p className="-translate-x-full absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[25.5px] left-[71.95px] not-italic text-[#1c1c1e] text-[17px] text-right top-[0.45px] whitespace-nowrap">$1090</p>
    </div>
  );
}

function P3() {
  return <div className="absolute h-[16.508px] left-0 top-[47.51px] w-[71.151px]" data-name="p" />;
}

function Container3() {
  return (
    <div className="relative shrink-0 w-[71.151px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <P1 />
        <P2 />
        <P3 />
      </div>
    </div>
  );
}

function Div1() {
  return (
    <div className="content-stretch flex gap-[23.989px] h-[64.014px] items-start justify-end relative shrink-0 w-full" data-name="div">
      <Container1 />
      <Container3 />
    </div>
  );
}

function P4() {
  return (
    <div className="h-[16.508px] relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16.5px] left-0 not-italic text-[#8e8e93] text-[11px] top-[0.63px] tracking-[0.55px] uppercase whitespace-nowrap">Outstanding balances</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-[rgba(0,122,255,0.1)] relative rounded-[27417100px] shrink-0 size-[23.989px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] not-italic relative shrink-0 text-[#007aff] text-[10px] whitespace-nowrap">J</p>
      </div>
    </div>
  );
}

function Span2() {
  return (
    <div className="flex-[1_0_0] h-[19.495px] min-w-px relative" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#1c1c1e] text-[13px] top-[0.63px] whitespace-nowrap">Jordan owes you</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[23.989px] relative shrink-0 w-[139.085px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[9.997px] items-center relative size-full">
        <Container7 />
        <Span2 />
      </div>
    </div>
  );
}

function Span3() {
  return (
    <div className="h-[19.495px] relative shrink-0 w-[25.024px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-0 not-italic text-[#007aff] text-[13px] top-[0.63px] whitespace-nowrap">$24</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="h-[23.989px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container6 />
          <Span3 />
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[rgba(0,122,255,0.1)] relative rounded-[27417100px] shrink-0 size-[23.989px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[15px] not-italic relative shrink-0 text-[#007aff] text-[10px] whitespace-nowrap">T</p>
      </div>
    </div>
  );
}

function Span4() {
  return (
    <div className="flex-[1_0_0] h-[19.495px] min-w-px relative" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#1c1c1e] text-[13px] top-[0.63px] whitespace-nowrap">Taylor owes you</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[23.989px] relative shrink-0 w-[134.003px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[9.997px] items-center relative size-full">
        <Container10 />
        <Span4 />
      </div>
    </div>
  );
}

function Span5() {
  return (
    <div className="h-[19.495px] relative shrink-0 w-[22.291px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[19.5px] left-0 not-italic text-[#007aff] text-[13px] top-[0.63px] whitespace-nowrap">$18</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex h-[23.989px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Span5 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[7.992px] h-[55.971px] items-start relative shrink-0 w-full" data-name="Container">
      <Container5 />
      <Container8 />
    </div>
  );
}

function Div2() {
  return (
    <div className="content-stretch flex flex-col gap-[7.992px] h-[93.276px] items-start pt-[12.805px] relative shrink-0 w-full" data-name="div">
      <div aria-hidden="true" className="absolute border-[#f7f7f5] border-solid border-t-[0.817px] inset-0 pointer-events-none" />
      <P4 />
      <Container4 />
    </div>
  );
}

export default function Link() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[15.997px] items-start pt-[19.993px] px-[19.993px] relative rounded-[22px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04),0px_4px_12px_0px_rgba(0,0,0,0.04)] size-full" data-name="Link">
      <Div />
      <Div1 />
      <Div2 />
    </div>
  );
}