import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          Журнал работ
        </Title>
      </Header>
      <Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Paragraph type="secondary">
          Скелет приложения. Далее здесь будет таблица записей, фильтр по дате и
          форма добавления.
        </Paragraph>
      </Content>
    </Layout>
  );
}

export default App;
