'use client';

import React, { useState, useMemo } from 'react';
import { MOCK_PRODUCTS, ProductRecord } from '../data/mockData';

type GroupByOption = 'none' | 'category' | 'region';
type SortColumn = 'productName' | 'category' | 'region' | 'price' | 'quantity' | 'revenue';
type SortDirection = 'asc' | 'desc';

// Aqreqasiya olunmus qrup melumatinin tipi
interface GroupData {
  key: string;
  rows: ProductRecord[];
  totalQuantity: number;
  totalRevenue: number;
  avgPrice: number;
  count: number;
}

export default function GroupedDataTable() {
  // Filtr, qruplasdirma ve cesidleme steytleri
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('category');
  const [sortColumn, setSortColumn] = useState<SortColumn>('productName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Acilmis/baglanmis qruplarin acarlari (Set strukturu)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['Electronics', 'Clothing', 'Home', 'North', 'South', 'East', 'West'])
  );

  // Secilmis setirin vurğulanmasi (Row highlighting)
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Aqreqasiya setirlerinin gorunurluyu
  const [showAggregates, setShowAggregates] = useState<boolean>(true);

  // 1. Datalarin axtaris sozune gore filtirlenmesi
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return MOCK_PRODUCTS;
    const term = searchTerm.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (item) =>
        item.productName.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.region.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // 2. Map istifade ederek qruplasdirma ve daxili sotlama (Memoized Tree)
  const groupedTree = useMemo<GroupData[]>(() => {
    if (groupBy === 'none') {
      const sortedRows = [...filteredData].sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      const totalQty = sortedRows.reduce((sum, r) => sum + r.quantity, 0);
      const totalRev = sortedRows.reduce((sum, r) => sum + r.revenue, 0);
      const avgP = sortedRows.length > 0 ? sortedRows.reduce((sum, r) => sum + r.price, 0) / sortedRows.length : 0;

      return [
        {
          key: 'All Products',
          rows: sortedRows,
          totalQuantity: totalQty,
          totalRevenue: totalRev,
          avgPrice: avgP,
          count: sortedRows.length,
        },
      ];
    }

    // Map strukturu daxil etme sirasini qoruyur
    const groupMap = new Map<string, ProductRecord[]>();

    for (const row of filteredData) {
      const groupKey = row[groupBy] ?? 'Unassigned';
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      groupMap.get(groupKey)!.push(row);
    }

    // Hər qrupun daxilindəki setirlerin cesidlenmesi ve aqreqasiyasi
    const result: GroupData[] = [];

    groupMap.forEach((rows, key) => {
      const sortedRows = [...rows].sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      const totalQuantity = sortedRows.reduce((acc, r) => acc + r.quantity, 0);
      const totalRevenue = sortedRows.reduce((acc, r) => acc + r.revenue, 0);
      // Orta qiymet qrup ortalamalarindan yox, birbasa xam setirlerden hesablanir
      const avgPrice = sortedRows.length > 0 ? sortedRows.reduce((acc, r) => acc + r.price, 0) / sortedRows.length : 0;

      result.push({
        key,
        rows: sortedRows,
        totalQuantity,
        totalRevenue,
        avgPrice,
        count: sortedRows.length,
      });
    });

    return result;
  }, [filteredData, groupBy, sortColumn, sortDirection]);

  // 3. Yekun Umumi Cemi (Grand Totals) - Birbasa filtirlenmis setirlerden hesablanir
  const grandTotals = useMemo(() => {
    const totalQuantity = filteredData.reduce((acc, r) => acc + r.quantity, 0);
    const totalRevenue = filteredData.reduce((acc, r) => acc + r.revenue, 0);
    const avgPrice = filteredData.length > 0 ? filteredData.reduce((acc, r) => acc + r.price, 0) / filteredData.length : 0;

    return {
      count: filteredData.length,
      totalQuantity,
      totalRevenue,
      avgPrice,
    };
  }, [filteredData]);

  // Qrup acilmasi/baglanmasi idareetmesi
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedGroups(new Set(groupedTree.map((g) => g.key)));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  // Sutun başliğina vurulduqda cesidleme kecidi
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
      {/* Səhifə Başlığı */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interactive Sales Data Table</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Group rows, aggregate metrics, sort columns, and inspect raw items dynamically.
          </p>
        </div>

        {/* Acilma/Baglanma ve Aqreqat acari duymeleri */}
        <div className="flex items-center gap-2">
          {groupBy !== 'none' && (
            <>
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Collapse All
              </button>
            </>
          )}
          <button
            onClick={() => setShowAggregates(!showAggregates)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              showAggregates
                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            {showAggregates ? 'Hide Group Totals' : 'Show Group Totals'}
          </button>
        </div>
      </div>

      {/* Axtariş və Qruplaşdırma Paneli */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by product name, category, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Group By
          </label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">None (Flat Table)</option>
            <option value="category">Category</option>
            <option value="region">Region</option>
          </select>
        </div>
      </div>

      {/* Cədvəl Konteyneri */}
      <div className="relative overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 max-h-[550px]">
        <table className="w-full text-left text-sm border-collapse">
          {/* Sticky Sütun Başlıqları */}
          <thead className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider shadow-sm">
            <tr>
              <th scope="col" className="p-3 border-b dark:border-gray-700 w-12"></th>
              <th
                scope="col"
                onClick={() => handleSort('productName')}
                className="p-3 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Product Name {sortColumn === 'productName' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th
                scope="col"
                onClick={() => handleSort('category')}
                className="p-3 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Category {sortColumn === 'category' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th
                scope="col"
                onClick={() => handleSort('region')}
                className="p-3 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Region {sortColumn === 'region' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th
                scope="col"
                onClick={() => handleSort('price')}
                className="p-3 border-b dark:border-gray-700 text-right cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Unit Price ($) {sortColumn === 'price' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th
                scope="col"
                onClick={() => handleSort('quantity')}
                className="p-3 border-b dark:border-gray-700 text-right cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Quantity {sortColumn === 'quantity' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th
                scope="col"
                onClick={() => handleSort('revenue')}
                className="p-3 border-b dark:border-gray-700 text-right cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Revenue ($) {sortColumn === 'revenue' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
            </tr>
          </thead>

          {/* Datalar Boş Olduqda */}
          {filteredData.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No products found matching your search query.
                </td>
              </tr>
            </tbody>
          )}

          {/* Hər Qrup Üçün Ayrı Semantik tbody */}
          {groupedTree.map((group) => {
            const isExpanded = expandedGroups.has(group.key);

            return (
              <tbody
                key={group.key}
                className="border-b dark:border-gray-800 last:border-none divide-y divide-gray-100 dark:divide-gray-800/50"
              >
                {/* Qrup Başlığı Sətiri */}
                {groupBy !== 'none' && (
                  <tr className="bg-gray-100/70 dark:bg-gray-800/70 font-semibold text-gray-800 dark:text-gray-200 sticky top-[37px] z-10">
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleGroup(group.key)}
                        aria-expanded={isExpanded}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none"
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </td>
                    <td colSpan={3} className="p-3">
                      <span className="font-bold">{group.key}</span>
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        ({group.count} {group.count === 1 ? 'item' : 'items'})
                      </span>
                    </td>
                    <td className="p-3 text-right text-xs text-gray-500 dark:text-gray-400">
                      Avg: ${group.avgPrice.toFixed(2)}
                    </td>
                    <td className="p-3 text-right">{group.totalQuantity}</td>
                    <td className="p-3 text-right text-blue-600 dark:text-blue-400 font-bold">
                      ${group.totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                )}

                {/* Sətirlərin Siyahısı (Yalnız qrup açıq olduqda göstərilir) */}
                {(groupBy === 'none' || isExpanded) &&
                  group.rows.map((row) => {
                    const isSelected = selectedRowId === row.id;

                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedRowId(isSelected ? null : row.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-100/70 dark:bg-blue-900/40 font-medium'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                        }`}
                      >
                        <td className="p-3 text-center text-xs text-gray-400">
                          {isSelected ? '●' : ''}
                        </td>
                        <td className="p-3 font-medium text-gray-900 dark:text-gray-100">
                          {row.productName}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{row.category}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{row.region}</td>
                        <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                          ${row.price.toFixed(2)}
                        </td>
                        <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                          {row.quantity}
                        </td>
                        <td className="p-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                          ${row.revenue.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}

                {/* Qrupun Açar Nəticələri (Group Aggregates Row) */}
                {groupBy !== 'none' && isExpanded && showAggregates && (
                  <tr className="bg-blue-50/50 dark:bg-blue-950/20 text-xs font-semibold text-blue-900 dark:text-blue-300 italic">
                    <td className="p-2 text-center">Σ</td>
                    <td colSpan={3} className="p-2">
                      Subtotal for {group.key}
                    </td>
                    <td className="p-2 text-right">Avg: ${group.avgPrice.toFixed(2)}</td>
                    <td className="p-2 text-right">{group.totalQuantity} units</td>
                    <td className="p-2 text-right font-bold">${group.totalRevenue.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            );
          })}

          {/* Yekun Grand Totals (Cədvəlin Ən Aşağı Hissəsi) */}
          {filteredData.length > 0 && (
            <tfoot className="sticky bottom-0 z-20 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold text-xs uppercase tracking-wider border-t-2 border-gray-300 dark:border-gray-700 shadow-lg">
              <tr>
                <td className="p-3 text-center">GRAND</td>
                <td colSpan={3} className="p-3">
                  Grand Total ({grandTotals.count} items)
                </td>
                <td className="p-3 text-right text-blue-600 dark:text-blue-400">
                  Avg: ${grandTotals.avgPrice.toFixed(2)}
                </td>
                <td className="p-3 text-right">{grandTotals.totalQuantity}</td>
                <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 text-sm">
                  ${grandTotals.totalRevenue.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}