import { Button, Card, Col, Grid, Layout, Modal, Row, Typography } from 'antd';
import { useState } from 'react';
import { WorkEntriesTable } from './components/WorkEntriesTable';
import { WorkEntryForm } from './components/WorkEntryForm';

const { Header, Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

function App() {
  const [reloadKey, setReloadKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleCreated = () => {
    setReloadKey((k) => k + 1);
    setModalOpen(false);
  };

  const addButton = (
    <Button type="primary" onClick={() => setModalOpen(true)}>
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
              <WorkEntriesTable reloadKey={reloadKey} />
            </Card>
          </Col>
        </Row>
      </Content>

      <Modal
        title="Добавить запись"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        width={isMobile ? 'calc(100vw - 32px)' : 520}
        styles={{ body: { padding: isMobile ? '16px 12px' : undefined } }}
      >
        <WorkEntryForm
          onCreated={handleCreated}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </Layout>
  );
}

export default App;
