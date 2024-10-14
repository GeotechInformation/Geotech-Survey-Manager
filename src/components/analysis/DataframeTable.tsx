// Dataframe Table tsx

import * as dfd from "danfojs";

const DataframeTable = ({ df }: { df: dfd.DataFrame }) => {
  if (!df) {
    return <div>No DataFrame available</div>;
  }

  // Convert DataFrame to 2D array for easier rendering
  const data: any[][] = df.values as any[][];
  const columns: string[] = df.columns as string[];

  // Helper function to round values to the nearest 4
  const roundToNearestFour = (value: number) => {
    return Math.round(value * 10000) / 10000;
  };

  return (
    <div className="text-sm p-2 rounded-md overflow-auto custom-scrollbar max-h-[70vh]">
      <table className="table-auto border-collapse border border-gray-200">
        <thead>
          <tr>
            {columns.map((col: string, index: number) => (
              <th key={index} className="border border-hsl-l80 dark:border-hsl-l20 p-1 font-medium">{col}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row: any[], rowIndex: number) => (
            <tr key={rowIndex}>
              {row.map((value: any, colIndex: number) => (
                <td key={colIndex} className="border border-hsl-l80 dark:border-hsl-l20 p-1 whitespace-nowrap text-center">
                  {typeof value === 'number'
                    ? roundToNearestFour(value).toString()
                    : value !== undefined && value !== null
                      ? value.toString()
                      : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataframeTable;
