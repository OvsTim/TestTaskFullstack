import {
  Button,
  DatePicker,
  Form,
  Grid,
  Input,
  InputNumber,
  Select,
  Space,
  message,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

const { useBreakpoint } = Grid;
import { fetchMeasurementUnits, type MeasurementUnit } from '../api/measurement-units';
import { fetchWorkTypes, type WorkType } from '../api/work-types';
import {
  WORK_ENTRY_PERFORMER_MAX_LENGTH,
  WORK_ENTRY_VOLUME_MAX,
  createWorkEntry,
  updateWorkEntry,
  type CreateWorkEntryBody,
  type WorkEntry,
} from '../api/work-entries';

type FormValues = {
  completedAt: Dayjs;
  workName: string;
  volume: number;
  unit: string;
  performer: string;
};

type WorkEntryFormProps = {
  entry?: WorkEntry;
  onSuccess: () => void;
  onCancel?: () => void;
};

function entryToFormValues(entry: WorkEntry): FormValues {
  return {
    completedAt: dayjs(entry.completedAt),
    workName: entry.workName,
    volume: Number(entry.volume),
    unit: entry.unit,
    performer: entry.performer,
  };
}

export function WorkEntryForm({ entry, onSuccess, onCancel }: WorkEntryFormProps) {
  const isEdit = entry !== undefined;
  const [form] = Form.useForm<FormValues>();
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [workTypesLoading, setWorkTypesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchMeasurementUnits(), fetchWorkTypes()])
      .then(([unitsData, workTypesData]) => {
        if (!cancelled) {
          setUnits(unitsData);
          setWorkTypes(workTypesData);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          message.error(
            error instanceof Error
              ? error.message
              : 'Не удалось загрузить справочники',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setUnitsLoading(false);
          setWorkTypesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (entry) {
      form.setFieldsValue(entryToFormValues(entry));
    } else {
      form.resetFields();
      form.setFieldsValue({ completedAt: dayjs() });
    }
  }, [entry, form]);

  const workTypeOptions = useMemo(() => {
    const names = new Set(workTypes.map((t) => t.name));
    const options = workTypes.map((t) => ({ value: t.name, label: t.name }));

    if (entry?.workName && !names.has(entry.workName)) {
      return [{ value: entry.workName, label: entry.workName }, ...options];
    }

    return options;
  }, [entry?.workName, workTypes]);

  const unitOptions = useMemo(() => {
    const names = new Set(units.map((u) => u.name));
    const options = units.map((u) => ({ value: u.name, label: u.name }));

    if (entry?.unit && !names.has(entry.unit)) {
      return [{ value: entry.unit, label: entry.unit }, ...options];
    }

    return options;
  }, [entry?.unit, units]);

  const handleFinish = async (values: FormValues) => {
    const input: CreateWorkEntryBody = {
      completedAt: values.completedAt.format('YYYY-MM-DD'),
      workName: values.workName,
      volume: values.volume,
      unit: values.unit,
      performer: values.performer.trim(),
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateWorkEntry(entry.id, input);
        message.success('Запись обновлена');
      } else {
        await createWorkEntry(input);
        message.success('Запись добавлена');
        form.resetFields();
        form.setFieldsValue({ completedAt: dayjs() });
      }
      onSuccess();
    } catch (error: unknown) {
      message.error(
        error instanceof Error
          ? error.message
          : isEdit
            ? 'Не удалось обновить запись'
            : 'Не удалось создать запись',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const workTypeSelect = (
    <Select
      placeholder="Выберите вид работ"
      loading={workTypesLoading}
      style={{ width: '100%' }}
      popupMatchSelectWidth={false}
      styles={{ popup: { root: { minWidth: 280 } } }}
      options={workTypeOptions}
      notFoundContent={
        workTypesLoading ? null : 'Нет видов работ. Добавьте через Swagger.'
      }
    />
  );

  const unitSelect = (
    <Select
      placeholder="Единица"
      loading={unitsLoading}
      style={{ width: '100%' }}
      popupMatchSelectWidth={false}
      styles={{ popup: { root: { minWidth: 240 } } }}
      options={unitOptions}
      notFoundContent={
        unitsLoading ? null : 'Нет единиц. Добавьте через Swagger.'
      }
    />
  );

  return (
    <Form
      form={form}
      layout="vertical"
      className="work-entry-form"
      onFinish={handleFinish}
      initialValues={entry ? entryToFormValues(entry) : { completedAt: dayjs() }}
    >
      <Form.Item
        label="Дата выполнения"
        name="completedAt"
        rules={[{ required: true, message: 'Укажите дату' }]}
      >
        <DatePicker
          className="work-entry-form-date"
          style={{ width: '100%', maxWidth: '100%' }}
          format="DD.MM.YYYY"
          inputReadOnly={isMobile}
        />
      </Form.Item>

      <Form.Item
        label="Вид работ"
        name="workName"
        rules={[{ required: true, message: 'Выберите вид работ' }]}
      >
        {workTypeSelect}
      </Form.Item>

      {isMobile ? (
        <>
          <Form.Item
            label="Объём"
            name="volume"
            rules={[{ required: true, message: 'Укажите объём' }]}
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
            label="Единица измерения"
            name="unit"
            rules={[{ required: true, message: 'Выберите единицу измерения' }]}
          >
            {unitSelect}
          </Form.Item>
        </>
      ) : (
        <Form.Item label="Объём" required style={{ marginBottom: 0 }}>
          <Space.Compact style={{ display: 'flex', gap: 8, width: '100%' }}>
            <Form.Item
              name="volume"
              rules={[{ required: true, message: 'Укажите объём' }]}
              style={{ flex: 1, minWidth: 0, marginBottom: 24 }}
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
              style={{ flex: '0 0 140px', marginBottom: 24 }}
            >
              {unitSelect}
            </Form.Item>
          </Space.Compact>
        </Form.Item>
      )}

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
        {onCancel ? (
          <Space>
            <Button onClick={onCancel}>Отмена</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {isEdit ? 'Сохранить' : 'Добавить запись'}
            </Button>
          </Space>
        ) : (
          <Button type="primary" htmlType="submit" loading={submitting}>
            {isEdit ? 'Сохранить' : 'Добавить запись'}
          </Button>
        )}
      </Form.Item>
    </Form>
  );
}
