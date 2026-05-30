import { Button, Card, Col, Grid, Layout, Modal, Row, Typography } from 'antd';
import { useState } from 'react';
import type { WorkEntry } from './api/work-entries';
import { WorkEntriesTable } from './components/WorkEntriesTable';
import { WorkEntryForm } from './components/WorkEntryForm';

const { Header, Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; entry: WorkEntry }
  | null;

function App() {
  const [reloadKey, setReloadKey] = useState(0);
  const [modal, setModal] = useState<ModalState>(null);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleSuccess = () => {
    setReloadKey((k) => k + 1);
    setModal(null);
  };

  const addButton = (
    <Button type="primary" onClick={() => setModal({ mode: 'create' })}>
      Добавить запись
    </Button>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: isMobile ? 16 : 24,
        }}
      >
        <Title level={isMobile ? 4 : 3} style={{ color: '#fff', margin: 0 }}>
          Журнал работ
        </Title>
        {isMobile && addButton}
      </Header>
      <Content
        style={{
          padding: isMobile ? 12 : 24,
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card title="Записи" extra={!isMobile ? addButton : undefined}>
              <WorkEntriesTable
                reloadKey={reloadKey}
                onEdit={(entry) => setModal({ mode: 'edit', entry })}
              />
            </Card>
          </Col>
        </Row>
      </Content>

      <Modal
        title={modal?.mode === 'edit' ? 'Редактировать запись' : 'Добавить запись'}
        open={modal !== null}
        onCancel={() => setModal(null)}
        footer={null}
        destroyOnHidden
        width={isMobile ? 'calc(100vw - 32px)' : 520}
        styles={{ body: { padding: isMobile ? '16px 12px' : undefined } }}
      >
        <WorkEntryForm
          key={modal?.mode === 'edit' ? modal.entry.id : 'create'}
          entry={modal?.mode === 'edit' ? modal.entry : undefined}
          onSuccess={handleSuccess}
          onCancel={() => setModal(null)}
        />
      </Modal>
    </Layout>
  );
}

export default App;
