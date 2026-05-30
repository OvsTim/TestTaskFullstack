import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, DatePicker, Flex, Grid, Popconfirm, Space, Table, message } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from 'antd/es/table/interface';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import type { PaginationMeta } from '../api/pagination';
import {
  WORK_ENTRIES_DEFAULT_LIMIT,
  WORK_ENTRIES_DEFAULT_PAGE,
  WORK_ENTRIES_DEFAULT_SORT,
  deleteWorkEntry,
  fetchWorkEntries,
  type WorkEntry,
  type WorkEntrySort,
} from '../api/work-entries';

const { useBreakpoint } = Grid;

const DEFAULT_META: PaginationMeta = {
  total: 0,
  page: WORK_ENTRIES_DEFAULT_PAGE,
  limit: WORK_ENTRIES_DEFAULT_LIMIT,
  totalPages: 0,
};

function formatDate(value: string) {
  return dayjs(value).format('DD.MM.YYYY');
}

type WorkEntriesTableProps = {
  reloadKey?: number;
  onEdit: (entry: WorkEntry) => void;
};

export function WorkEntriesTable({ reloadKey = 0, onEdit }: WorkEntriesTableProps) {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(WORK_ENTRIES_DEFAULT_PAGE);
  const [limit, setLimit] = useState(WORK_ENTRIES_DEFAULT_LIMIT);
  const [sort, setSort] = useState<WorkEntrySort>(WORK_ENTRIES_DEFAULT_SORT);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(
    null,
  );
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWorkEntries({
        page,
        limit,
        sort,
        from: dateRange?.[0]?.format('YYYY-MM-DD'),
        to: dateRange?.[1]?.format('YYYY-MM-DD'),
      });
      setEntries(response.data);
      setMeta(response.meta);
    } catch (error: unknown) {
      message.error(
        error instanceof Error ? error.message : 'Не удалось загрузить записи',
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange, limit, page, sort]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries, reloadKey]);

  const handleDateRangeChange = (range: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(range);
    setPage(WORK_ENTRIES_DEFAULT_PAGE);
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<WorkEntry> | SorterResult<WorkEntry>[],
    extra: TableCurrentDataSource<WorkEntry>,
  ) => {
    if (extra.action === 'paginate') {
      const nextPage = pagination.current ?? WORK_ENTRIES_DEFAULT_PAGE;
      const nextLimit = pagination.pageSize ?? WORK_ENTRIES_DEFAULT_LIMIT;

      if (nextLimit !== limit) {
        setLimit(nextLimit);
        setPage(WORK_ENTRIES_DEFAULT_PAGE);
      } else if (nextPage !== page) {
        setPage(nextPage);
      }
      return;
    }

    if (extra.action === 'sort') {
      const dateSorter = Array.isArray(sorter) ? sorter[0] : sorter;
      let nextSort: WorkEntrySort;

      if (dateSorter.order === 'ascend') {
        nextSort = 'asc';
      } else if (dateSorter.order === 'descend') {
        nextSort = 'desc';
      } else {
        // Controlled sortOrder always set — Ant Design tries to cancel on 3rd click
        nextSort = sort === 'desc' ? 'asc' : 'desc';
      }

      if (nextSort !== sort) {
        setSort(nextSort);
        setPage(WORK_ENTRIES_DEFAULT_PAGE);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkEntry(id);
      message.success('Запись удалена');
      loadEntries();
    } catch (error: unknown) {
      message.error(
        error instanceof Error ? error.message : 'Не удалось удалить запись',
      );
    }
  };

  const columns: ColumnsType<WorkEntry> = [
    {
      title: 'Дата',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: formatDate,
      width: 112,
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      sortOrder: sort === 'asc' ? 'ascend' : 'descend',
    },
    {
      title: 'Работы',
      dataIndex: 'workName',
      key: 'workName',
      ellipsis: true,
    },
    {
      title: 'Объём',
      key: 'volume',
      width: 100,
      render: (_, record) => `${record.volume} ${record.unit}`,
    },
    {
      title: 'Исполнитель',
      dataIndex: 'performer',
      key: 'performer',
      width: 140,
      ellipsis: true,
    },
    {
      title: '',
      key: 'actions',
      width: isMobile ? 88 : 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          {isMobile ? (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          ) : (
            <Button type="link" size="small" onClick={() => onEdit(record)}>
              Изменить
            </Button>
          )}
          <Popconfirm
            title="Удалить запись?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            {isMobile ? (
              <Button type="link" danger size="small" icon={<DeleteOutlined />} />
            ) : (
              <Button type="link" danger size="small">
                Удалить
              </Button>
            )}
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Flex vertical gap="middle" style={{ width: '100%' }}>
      <DatePicker.RangePicker
        value={dateRange}
        onChange={handleDateRangeChange}
        format="DD.MM.YYYY"
        allowEmpty={[true, true]}
        placeholder={['С', 'По']}
        style={{ width: '100%', maxWidth: isMobile ? '100%' : 360 }}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={entries}
        loading={loading}
        onChange={handleTableChange}
        pagination={{
          current: page,
          pageSize: limit,
          total: meta.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Всего ${total}`,
        }}
        scroll={{ x: 640 }}
        locale={{ emptyText: 'Записей пока нет' }}
        style={{ width: '100%' }}
      />
    </Flex>
  );
}
