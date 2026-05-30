import { DeleteOutlined } from '@ant-design/icons';
import { Button, DatePicker, Grid, Popconfirm, Space, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import {
  WORK_ENTRIES_DEFAULT_SORT,
  WORK_ENTRIES_LIMIT_MAX,
  deleteWorkEntry,
  fetchWorkEntries,
  type WorkEntry,
} from '../api/work-entries';

const { useBreakpoint } = Grid;

function formatDate(value: string) {
  return dayjs(value).format('DD.MM.YYYY');
}

type WorkEntriesTableProps = {
  reloadKey?: number;
};

export function WorkEntriesTable({ reloadKey = 0 }: WorkEntriesTableProps) {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(
    null,
  );
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchWorkEntries({
        from: dateRange?.[0]?.format('YYYY-MM-DD'),
        to: dateRange?.[1]?.format('YYYY-MM-DD'),
        sort: WORK_ENTRIES_DEFAULT_SORT,
        limit: WORK_ENTRIES_LIMIT_MAX,
      });
      setEntries(response.data);
    } catch (error: unknown) {
      message.error(
        error instanceof Error ? error.message : 'Не удалось загрузить записи',
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries, reloadKey]);

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
      width: 100,
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
      width: isMobile ? 48 : 100,
      fixed: 'right',
      render: (_, record) => (
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
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <DatePicker.RangePicker
        value={dateRange}
        onChange={(range) => setDateRange(range)}
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
        pagination={false}
        scroll={{ x: 640 }}
        locale={{ emptyText: 'Записей пока нет' }}
      />
    </Space>
  );
}
