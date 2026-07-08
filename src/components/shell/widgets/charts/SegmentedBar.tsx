import { scaleLinear } from "@visx/scale";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";

export type BarSegment = {
  value: number;
  color: string;
  opacity?: number;
};

export type BarGroupData = {
  key: string;
  segments: BarSegment[];
};

type SegmentedBarProps = {
  groups: BarGroupData[];
  total: number;
  width?: number;
  height?: number;
  groupGap?: number;
  cornerRadius?: number;
};

export default function SegmentedBar({
  groups,
  total,
  width = 268,
  height = 13,
  groupGap = 3,
  cornerRadius = 4,
}: SegmentedBarProps) {
  const groupTotals = groups.map((group) =>
    group.segments.reduce((sum, segment) => sum + segment.value, 0),
  );
  const sumOfGroups = groupTotals.reduce((sum, value) => sum + value, 0);
  const domainMax = Math.max(total, sumOfGroups, 1);
  const usableWidth = Math.max(width - groupGap * Math.max(groups.length - 1, 0), 0);

  const scale = scaleLinear({
    domain: [0, domainMax],
    range: [0, usableWidth],
  });

  const layout = groups.reduce<{ x: number; groupWidth: number }[]>((acc, _group, groupIndex) => {
    const previous = acc[groupIndex - 1];
    const x = previous ? previous.x + previous.groupWidth + groupGap : 0;
    acc.push({ x, groupWidth: scale(groupTotals[groupIndex]) });
    return acc;
  }, []);

  return (
    <svg width={width} height={height} role="img" aria-hidden="true">
      {groups.map((group, groupIndex) => {
        const { x: groupX, groupWidth } = layout[groupIndex];
        if (groupWidth <= 0) return null;

        const clipId = `segmented-bar-clip-${group.key}`;
        const segmentLayout = group.segments.reduce<{ x: number; segmentWidth: number }[]>(
          (acc, segment, segmentIndex) => {
            const previous = acc[segmentIndex - 1];
            const x = previous ? previous.x + previous.segmentWidth : 0;
            acc.push({ x, segmentWidth: scale(segment.value) });
            return acc;
          },
          [],
        );

        return (
          <Group key={group.key} left={groupX}>
            <clipPath id={clipId}>
              <rect width={groupWidth} height={height} rx={cornerRadius} ry={cornerRadius} />
            </clipPath>
            <Group clipPath={`url(#${clipId})`}>
              {group.segments.map((segment, segmentIndex) => {
                const { x: rectX, segmentWidth } = segmentLayout[segmentIndex];
                if (segmentWidth <= 0) return null;
                return (
                  <Bar
                    key={segmentIndex}
                    x={rectX}
                    y={0}
                    width={segmentWidth}
                    height={height}
                    fill={segment.color}
                    fillOpacity={segment.opacity ?? 1}
                  />
                );
              })}
            </Group>
          </Group>
        );
      })}
    </svg>
  );
}
