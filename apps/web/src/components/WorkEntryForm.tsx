import { Button, DatePicker, Form, Input, InputNumber, Select, message } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { fetchMeasurementUnits, type MeasurementUnit } from '../api/measurement-units';
import {
  WORK_ENTRY_PERFORMER_MAX_LENGTH,
  WORK_ENTRY_VOLUME_MAX,
  WORK_ENTRY_WORK_NAME_MAX_LENGTH,
  createWorkEntry,
  type CreateWorkEntryBody,
} from '../api/work-entries';

type FormValues = {
  completedAt: Dayjs;
  workName: string;
  volume: number;
  unit: string;
  performer: string;
};

type WorkEntryFormProps = {
  onCreated: () => void;
};

export function WorkEntryForm({ onCreated }: WorkEntryFormProps) {
  const [form] = Form.useForm<FormValues>();
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchMeasurementUnits()
      .then((data) => {
        if (!cancelled) {
          setUnits(data);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          message.error(
            error instanceof Error
              ? error.message
              : 'Не удалось загрузить единицы измерения',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setUnitsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFinish = async (values: FormValues) => {
    const input: CreateWorkEntryBody = {
      completedAt: values.completedAt.format('YYYY-MM-DD'),
      workName: values.workName.trim(),
      volume: values.volume,
      unit: values.unit,
      performer: values.performer.trim(),
    };

    setSubmitting(true);
    try {
      await createWorkEntry(input);
      message.success('Запись добавлена');
      form.resetFields();
      onCreated();
    } catch (error: unknown) {
      message.error(
        error instanceof Error ? error.message : 'Не удалось создать запись',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ completedAt: dayjs() }}
    >
      <Form.Item
        label="Дата выполнения"
        name="completedAt"
        rules={[{ required: true, message: 'Укажите дату' }]}
      >
        <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
      </Form.Item>

      <Form.Item
        label="Наименование работ"
        name="workName"
        rules={[{ required: true, message: 'Укажите наименование работ' }]}
      >
        <Input
          placeholder="Кладка стены"
          maxLength={WORK_ENTRY_WORK_NAME_MAX_LENGTH}
        />
      </Form.Item>

      <Form.Item label="Объём" required style={{ marginBottom: 0 }}>
        <Input.Group compact style={{ display: 'flex' }}>
          <Form.Item
            name="volume"
            rules={[{ required: true, message: 'Укажите объём' }]}
            style={{ flex: 1, marginBottom: 24 }}
          >
            <InputNumber
              min={0.01}
              max={WORK_ENTRY_VOLUME_MAX}
              precision={2}
              style={{ width: '100%' }}
              placeholder="24"
            />
          </Form.Item>
          <Form.Item
            name="unit"
            rules={[{ required: true, message: 'Выберите единицу измерения' }]}
            style={{ width: 140, marginBottom: 24 }}
          >
            <Select
              placeholder="Ед."
              loading={unitsLoading}
              options={units.map((u) => ({ value: u.name, label: u.name }))}
              notFoundContent={
                unitsLoading ? null : 'Нет единиц. Добавьте через Swagger.'
              }
            />
          </Form.Item>
        </Input.Group>
      </Form.Item>

      <Form.Item
        label="Исполнитель"
        name="performer"
        rules={[{ required: true, message: 'Укажите исполнителя' }]}
      >
        <Input
          placeholder="Иванов И.И."
          maxLength={WORK_ENTRY_PERFORMER_MAX_LENGTH}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>
          Добавить запись
        </Button>
      </Form.Item>
    </Form>
  );
}
