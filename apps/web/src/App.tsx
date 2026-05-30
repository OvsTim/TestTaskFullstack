import { Card, Col, Layout, Row, Typography } from 'antd';
import { useState } from 'react';
import { WorkEntriesTable } from './components/WorkEntriesTable';
import { WorkEntryForm } from './components/WorkEntryForm';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          Журнал работ
        </Title>
      </Header>
      <Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card title="Записи">
              <WorkEntriesTable reloadKey={reloadKey} />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="Добавить запись">
              <WorkEntryForm onCreated={() => setReloadKey((k) => k + 1)} />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default App;
