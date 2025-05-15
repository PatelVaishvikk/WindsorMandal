import { useState } from 'react';
import { Container, Card, Table, Button, Form, Row, Col, Alert, Tabs, Tab, InputGroup } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import Head from 'next/head';

export default function GroceryPage() {
  // Grocery stock state
  const [items, setItems] = useState([
    // Example: { name: 'Rice', quantity: 2, unit: 'kg', minStock: 1, toBuy: false }
  ]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '', minStock: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [editItem, setEditItem] = useState({});
  const [tab, setTab] = useState('stock');

  // Sabha usage state
  const [sabhaRecords, setSabhaRecords] = useState([]); // { date, menu, groceriesUsed: [{ name, quantity, unit }] }
  const [newSabha, setNewSabha] = useState({ date: '', menu: '', groceriesUsed: [] });
  const [sabhaGrocery, setSabhaGrocery] = useState({ name: '', quantity: '', unit: '' });

  // Add new grocery item
  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.unit) return;
    setItems([...items, { ...newItem, quantity: Number(newItem.quantity), minStock: Number(newItem.minStock) || 0, toBuy: false }]);
    setNewItem({ name: '', quantity: '', unit: '', minStock: '' });
  };

  // Edit grocery item
  const handleEditItem = (idx) => {
    setEditIndex(idx);
    setEditItem(items[idx]);
  };
  const handleSaveEdit = () => {
    const updated = [...items];
    updated[editIndex] = { ...editItem, quantity: Number(editItem.quantity), minStock: Number(editItem.minStock) || 0 };
    setItems(updated);
    setEditIndex(null);
    setEditItem({});
  };
  const handleDeleteItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };
  const handleToggleToBuy = (idx) => {
    setItems(items.map((item, i) => i === idx ? { ...item, toBuy: !item.toBuy } : item));
  };

  // Add grocery used in Sabha
  const handleAddSabhaGrocery = () => {
    if (!sabhaGrocery.name || !sabhaGrocery.quantity || !sabhaGrocery.unit) return;
    setNewSabha({
      ...newSabha,
      groceriesUsed: [...(newSabha.groceriesUsed || []), { ...sabhaGrocery, quantity: Number(sabhaGrocery.quantity) }]
    });
    setSabhaGrocery({ name: '', quantity: '', unit: '' });
  };
  // Add Sabha record
  const handleAddSabha = () => {
    if (!newSabha.date || !newSabha.menu) return;
    setSabhaRecords([...sabhaRecords, newSabha]);
    // Optionally deduct used groceries from stock
    setItems(items.map(item => {
      const used = (newSabha.groceriesUsed || []).find(g => g.name === item.name);
      if (used) {
        return { ...item, quantity: Math.max(0, item.quantity - used.quantity) };
      }
      return item;
    }));
    setNewSabha({ date: '', menu: '', groceriesUsed: [] });
  };

  // Shopping list: items marked toBuy or below minStock
  const shoppingList = items.filter(item => item.toBuy || (item.minStock && item.quantity <= item.minStock));

  return (
    <>
      <Head>
        <title>Grocery Management - HSAPSS Windsor</title>
      </Head>
      <Navbar />
      <Container className="py-4">
        <h2 className="fw-bold mb-4">Grocery Management</h2>
        <Tabs activeKey={tab} onSelect={setTab} className="mb-4">
          <Tab eventKey="stock" title="Stock">
            <Card className="mb-4">
              <Card.Header>Current Stock</Card.Header>
              <Card.Body>
                <Table bordered responsive hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Min Stock</th>
                      <th>To Buy</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && (
                      <tr><td colSpan={6} className="text-center text-muted">No items in stock.</td></tr>
                    )}
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{editIndex === idx ? <Form.Control size="sm" value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} /> : item.name}</td>
                        <td>{editIndex === idx ? <Form.Control size="sm" type="number" value={editItem.quantity} onChange={e => setEditItem({ ...editItem, quantity: e.target.value })} /> : item.quantity}</td>
                        <td>{editIndex === idx ? <Form.Control size="sm" value={editItem.unit} onChange={e => setEditItem({ ...editItem, unit: e.target.value })} /> : item.unit}</td>
                        <td>{editIndex === idx ? <Form.Control size="sm" type="number" value={editItem.minStock} onChange={e => setEditItem({ ...editItem, minStock: e.target.value })} /> : item.minStock}</td>
                        <td>
                          <Form.Check type="checkbox" checked={item.toBuy} onChange={() => handleToggleToBuy(idx)} disabled={editIndex === idx} />
                        </td>
                        <td>
                          {editIndex === idx ? (
                            <>
                              <Button size="sm" variant="success" className="me-2" onClick={handleSaveEdit}>Save</Button>
                              <Button size="sm" variant="secondary" onClick={() => setEditIndex(null)}>Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="primary" className="me-2" onClick={() => handleEditItem(idx)}>Edit</Button>
                              <Button size="sm" variant="danger" onClick={() => handleDeleteItem(idx)}>Delete</Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <h6 className="mt-4">Add New Item</h6>
                <Row className="g-2 align-items-end">
                  <Col md={3}><Form.Control size="sm" placeholder="Name" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} /></Col>
                  <Col md={2}><Form.Control size="sm" type="number" placeholder="Quantity" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} /></Col>
                  <Col md={2}><Form.Control size="sm" placeholder="Unit" value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} /></Col>
                  <Col md={2}><Form.Control size="sm" type="number" placeholder="Min Stock" value={newItem.minStock} onChange={e => setNewItem({ ...newItem, minStock: e.target.value })} /></Col>
                  <Col md={2}><Button size="sm" variant="success" onClick={handleAddItem}>Add</Button></Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>
          <Tab eventKey="shopping" title="Shopping List">
            <Card>
              <Card.Header>Shopping List</Card.Header>
              <Card.Body>
                {shoppingList.length === 0 ? (
                  <Alert variant="info">No items to buy. All stocks are sufficient!</Alert>
                ) : (
                  <Table bordered responsive hover className="align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Min Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shoppingList.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unit}</td>
                          <td>{item.minStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Tab>
          <Tab eventKey="sabha" title="Sabha Usage / History">
            <Card>
              <Card.Header>Sabha Usage / History</Card.Header>
              <Card.Body>
                <h6 className="mb-3">Record Sabha Dinner</h6>
                <Row className="g-2 align-items-end mb-3">
                  <Col md={3}><Form.Control size="sm" type="date" value={newSabha.date} onChange={e => setNewSabha({ ...newSabha, date: e.target.value })} /></Col>
                  <Col md={3}><Form.Control size="sm" placeholder="Menu (e.g., Pav Bhaji)" value={newSabha.menu} onChange={e => setNewSabha({ ...newSabha, menu: e.target.value })} /></Col>
                  <Col md={2}><Form.Control size="sm" placeholder="Grocery Name" value={sabhaGrocery.name} onChange={e => setSabhaGrocery({ ...sabhaGrocery, name: e.target.value })} /></Col>
                  <Col md={2}><Form.Control size="sm" type="number" placeholder="Qty Used" value={sabhaGrocery.quantity} onChange={e => setSabhaGrocery({ ...sabhaGrocery, quantity: e.target.value })} /></Col>
                  <Col md={1}><Form.Control size="sm" placeholder="Unit" value={sabhaGrocery.unit} onChange={e => setSabhaGrocery({ ...sabhaGrocery, unit: e.target.value })} /></Col>
                  <Col md={1}><Button size="sm" variant="secondary" onClick={handleAddSabhaGrocery}>Add</Button></Col>
                </Row>
                {newSabha.groceriesUsed && newSabha.groceriesUsed.length > 0 && (
                  <Table bordered size="sm" className="mb-3">
                    <thead><tr><th>Grocery</th><th>Qty Used</th><th>Unit</th></tr></thead>
                    <tbody>
                      {newSabha.groceriesUsed.map((g, idx) => (
                        <tr key={idx}><td>{g.name}</td><td>{g.quantity}</td><td>{g.unit}</td></tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                <Button size="sm" variant="success" onClick={handleAddSabha}>Save Sabha Record</Button>
                <hr />
                <h6>Sabha History</h6>
                {sabhaRecords.length === 0 ? (
                  <Alert variant="info">No Sabha records yet.</Alert>
                ) : (
                  <Table bordered responsive hover className="align-middle">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Menu</th>
                        <th>Groceries Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sabhaRecords.map((rec, idx) => (
                        <tr key={idx}>
                          <td>{rec.date}</td>
                          <td>{rec.menu}</td>
                          <td>
                            <ul className="mb-0">
                              {(rec.groceriesUsed || []).map((g, i) => (
                                <li key={i}>{g.name} - {g.quantity} {g.unit}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
} 