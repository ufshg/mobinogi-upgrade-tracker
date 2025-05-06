"use client";

import { useState, MouseEvent, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Chart.js 등록
ChartJS.register(ArcElement, Tooltip, Legend);

const itemTypes = ["무기", "방어구", "장신구"];
const upgradeStages = ["0 → 1", "1 → 2", "2 → 3", "3 → 4", "4 → 5", "5 → 6"];

type StageCount = { success: number; fail: number };

const displayedRates = [0.9, 0.85, 0.8, 0.5, 0.4, 0.1]; // 0~1 사이 값

const dummyCounts = {
  무기: [
    { success: 90, fail: 10 }, // 0→1
    { success: 85, fail: 15 }, // 1→2
    { success: 80, fail: 20 }, // 2→3
    { success: 25, fail: 25 }, // 3→4
    { success: 16, fail: 24 }, // 4→5
    { success: 2, fail: 18 }, // 5→6
  ],
  방어구: [
    { success: 45, fail: 5 },
    { success: 40, fail: 10 },
    { success: 35, fail: 15 },
    { success: 20, fail: 20 },
    { success: 12, fail: 18 },
    { success: 1, fail: 19 },
  ],
  장신구: [
    { success: 60, fail: 40 },
    { success: 55, fail: 45 },
    { success: 50, fail: 50 },
    { success: 15, fail: 35 },
    { success: 8, fail: 32 },
    { success: 0, fail: 20 },
  ],
};

// 단색 카운트 버튼
function SolidCountButton({
  value,
  onDecrement,
  onIncrement,
  color,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  color: string;
}) {
  // 클릭 위치에 따라 -/+ 분기
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      onDecrement();
    } else {
      onIncrement();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        w-20 h-10 rounded-lg font-semibold text-white select-none
        shadow-md transition-all duration-150
        flex items-center justify-center
        hover:scale-105 active:scale-95
        outline-none border-none
      `}
      style={{
        background: color,
        fontSize: "1.1rem",
        userSelect: "none",
        padding: 0,
      }}
      title="왼쪽 클릭: - / 오른쪽 클릭: +"
    >
      {value}
    </button>
  );
}

function ItemUpgradeBox({
  itemType,
  counts,
  setCounts,
}: {
  itemType: string;
  counts: StageCount[];
  setCounts: (counts: StageCount[]) => void;
}) {
  const adjustCount = (
    stageIdx: number,
    type: "success" | "fail",
    delta: 1 | -1
  ) => {
    const newCounts = counts.map((c, i) =>
      i === stageIdx
        ? {
            ...c,
            [type]: Math.max(0, c[type] + delta),
          }
        : c
    );
    setCounts(newCounts);
  };

  return (
    <div
      className={`
        flex flex-col gap-4 p-6 rounded-2xl shadow-xl
        bg-white/80 backdrop-blur-md border border-gray-200
        max-w-xs w-full
        hover:shadow-2xl transition-shadow duration-200
      `}
    >
      <h2 className="text-xl font-extrabold mb-2 text-center tracking-tight text-gray-800 drop-shadow">
        {itemType}
      </h2>
      <table className="w-full text-center table-fixed border-separate border-spacing-y-1">
        <colgroup>
          <col style={{ width: "33%" }} />
          <col style={{ width: "33%" }} />
          <col style={{ width: "34%" }} />
        </colgroup>
        <thead>
          <tr>
            <th className="py-1 text-base bg-gray-100 rounded-t-md">단계</th>
            <th className="py-1 text-base bg-gray-100 rounded-t-md">성공</th>
            <th className="py-1 text-base bg-gray-100 rounded-t-md">실패</th>
          </tr>
        </thead>
        <tbody>
          {upgradeStages.map((stage, idx) => (
            <tr key={stage} className="bg-white/70 hover:bg-gray-50 transition">
              <td className="py-1 text-base font-medium">{stage}</td>
              <td className="py-1">
                <SolidCountButton
                  value={counts[idx].success}
                  onDecrement={() => adjustCount(idx, "success", -1)}
                  onIncrement={() => adjustCount(idx, "success", 1)}
                  color="#22c55e"
                />
              </td>
              <td className="py-1">
                <SolidCountButton
                  value={counts[idx].fail}
                  onDecrement={() => adjustCount(idx, "fail", -1)}
                  onIncrement={() => adjustCount(idx, "fail", 1)}
                  color="#ef4444"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SuccessFailDoughnut({
  success,
  fail,
  label,
  stageIdx,
}: {
  success: number;
  fail: number;
  label: string;
  stageIdx: number;
}) {
  const total = success + fail;
  const userRate = total === 0 ? 0 : success / total;
  const displayRate = displayedRates[stageIdx];

  const data = {
    labels: ["성공", "실패"],
    datasets: [
      {
        data: [success, fail],
        backgroundColor: ["#22c55e", "#ef4444"],
        borderWidth: 2,
        hoverOffset: 2,
      },
      {
        data: [displayRate * 100, (1 - displayRate) * 100],
        backgroundColor: ["#bbf7d0", "#fecaca"],
        borderWidth: 2,
        hoverOffset: 0,
      },
    ],
  };

  return (
    <div className="flex flex-col items-center w-28">
      <Doughnut
        data={data}
        width={80}
        height={80}
        options={{
          cutout: "65%",
          radius: "90%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
          animation: false,
        }}
      />
      <div className="text-xs mt-2 font-semibold text-gray-700">{label}</div>
      <div className="text-xs text-gray-500 leading-tight mt-1 text-center">
        {total === 0 ? (
          <>
            <div>표기 {(displayRate * 100).toFixed(1)}%</div>
          </>
        ) : (
          <>
            <div>성공률 {(userRate * 100).toFixed(1)}%</div>
            <div>표기 {(displayRate * 100).toFixed(1)}%</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [serverCounts, setServerCounts] =
    useState<Record<string, StageCount[]>>(dummyCounts);
  const [formCounts, setFormCounts] = useState<Record<string, StageCount[]>>(
    {}
  );

  useEffect(() => {
    fetch("/api/summary")
      .then((res) => res.json())
      .then((data) => setServerCounts(data));
  }, []);

  const setItemCounts = (itemType: string, counts: StageCount[]) => {
    setFormCounts((prev) => ({
      ...prev,
      [itemType]: counts,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      itemTypes
        .map(
          (itemType) =>
            `아이템: ${itemType}\n${formCounts[itemType]
              .map(
                (c, i) =>
                  `  ${upgradeStages[i]}: 성공 ${c.success}회, 실패 ${c.fail}회`
              )
              .join("\n")}`
        )
        .join("\n\n")
    );
    // TODO: 서버로 데이터 전송 등 추가 가능
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 via-white to-green-50">
      <h1 className="text-3xl sm:text-4xl font-extrabold mt-10 mb-8 text-gray-800 tracking-tight drop-shadow">
        승급 결과 입력
      </h1>
      <div className="w-full flex flex-col items-center gap-8 mb-12 mt-8">
        {itemTypes.map((itemType) => (
          <div
            key={itemType}
            className="w-full max-w-5xl flex flex-col items-start"
          >
            <div className="text-lg font-bold mb-2 ml-2 text-gray-700">
              {itemType}
            </div>
            <div className="flex flex-row gap-4 w-full justify-center flex-wrap">
              {upgradeStages.map((stage, idx) => (
                <SuccessFailDoughnut
                  key={stage}
                  success={serverCounts[itemType][idx].success}
                  fail={serverCounts[itemType][idx].fail}
                  label={stage}
                  stageIdx={idx}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-8 w-full"
      >
        <div className="flex flex-col sm:flex-row gap-8 w-full justify-center">
          {itemTypes.map((itemType) => (
            <ItemUpgradeBox
              key={itemType}
              itemType={itemType}
              counts={formCounts[itemType] || dummyCounts[itemType]}
              setCounts={(counts) => setItemCounts(itemType, counts)}
            />
          ))}
        </div>
        <button
          type="submit"
          className="mt-8 bg-blue-500 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-blue-600 active:bg-blue-700 transition-all text-lg font-bold tracking-wide"
        >
          제출
        </button>
      </form>
    </div>
  );
}
