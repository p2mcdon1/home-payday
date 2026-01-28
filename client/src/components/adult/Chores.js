import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Card, Table, Button, Form, Alert, Spinner, Modal, Toast, ToastContainer } from 'react-bootstrap';
import api from '../../utils/api';

function Chores() {
  const [activeTab, setActiveTab] = useState('chores');
  const [chores, setChores] = useState([]);
  const [lifecycles, setLifecycles] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Chores state
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [choreFormData, setChoreFormData] = useState({
    id: null,
    name: '',
    description: '',
    link: '',
    enabled: true,
    lifecycleId: '',
    rateId: ''
  });

  // Lifecycles state
  const [showLifecycleForm, setShowLifecycleForm] = useState(false);
  const [lifecycleFormData, setLifecycleFormData] = useState({
    id: null,
    infinite: false,
    daily: false,
    daysOfWeekMask: '',
    maxPerDay: '',
    maxPerHour: ''
  });

  // Rates state
  const [showRateForm, setShowRateForm] = useState(false);
  const [rateFormData, setRateFormData] = useState({
    id: null,
    each: '',
    formula: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  // Auto-dismiss error toast after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [choresRes, lifecyclesRes, ratesRes] = await Promise.all([
        api.get('/adult/chores'),
        api.get('/adult/lifecycles'),
        api.get('/adult/rates')
      ]);
      setChores(choresRes.data);
      setLifecycles(lifecyclesRes.data);
      setRates(ratesRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Chores handlers
  const handleChoreSubmit = async (e) => {
    e.preventDefault();
    try {
      if (choreFormData.id) {
        await api.put(`/adult/chores/${choreFormData.id}`, choreFormData);
      } else {
        await api.post('/adult/chores', choreFormData);
      }
      setShowChoreForm(false);
      resetChoreForm();
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save chore');
    }
  };

  const handleEditChore = (chore) => {
    setChoreFormData({
      id: chore.id,
      name: chore.name,
      description: chore.description || '',
      link: chore.link || '',
      enabled: chore.enabled !== undefined ? chore.enabled : true,
      lifecycleId: chore.lifecycleId,
      rateId: chore.rateId
    });
    setShowChoreForm(true);
  };

  const handleDeleteChore = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chore?')) return;
    try {
      await api.delete(`/adult/chores/${id}`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete chore');
    }
  };

  const handleToggleEnabledChore = async (chore) => {
    try {
      // the body should be the entire chore with the enabled field toggled
      await api.put(`/adult/chores/${chore.id}`, { ...chore, enabled: !chore.enabled }); 
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to enable/disable chore');
    }
  };

  const resetChoreForm = () => {
    setChoreFormData({
      id: null,
      name: '',
      description: '',
      link: '',
      enabled: true,
      lifecycleId: '',
      rateId: ''
    });
  };

  // Lifecycles handlers
  const handleLifecycleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...lifecycleFormData,
        infinite: lifecycleFormData.infinite === true || lifecycleFormData.infinite === 'true',
        daily: lifecycleFormData.daily === true || lifecycleFormData.daily === 'true',
        daysOfWeekMask: lifecycleFormData.daysOfWeekMask ? parseInt(lifecycleFormData.daysOfWeekMask) : null,
        maxPerDay: lifecycleFormData.maxPerDay ? parseInt(lifecycleFormData.maxPerDay) : null,
        maxPerHour: lifecycleFormData.maxPerHour ? parseInt(lifecycleFormData.maxPerHour) : null
      };
      
      if (lifecycleFormData.id) {
        await api.put(`/adult/lifecycles/${lifecycleFormData.id}`, data);
      } else {
        await api.post('/adult/lifecycles', data);
      }
      setShowLifecycleForm(false);
      resetLifecycleForm();
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save lifecycle');
    }
  };

  const handleEditLifecycle = (lifecycle) => {
    setLifecycleFormData({
      id: lifecycle.id,
      infinite: lifecycle.infinite,
      daily: lifecycle.daily,
      daysOfWeekMask: lifecycle.daysOfWeekMask || '',
      maxPerDay: lifecycle.maxPerDay || '',
      maxPerHour: lifecycle.maxPerHour || ''
    });
    setShowLifecycleForm(true);
  };

  const handleDeleteLifecycle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lifecycle?')) return;
    try {
      await api.delete(`/adult/lifecycles/${id}`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete lifecycle');
    }
  };

  const resetLifecycleForm = () => {
    setLifecycleFormData({
      id: null,
      infinite: false,
      daily: false,
      daysOfWeekMask: '',
      maxPerDay: '',
      maxPerHour: ''
    });
  };

  // Rates handlers
  const handleRateSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        each: rateFormData.each ? parseFloat(rateFormData.each) : null,
        formula: rateFormData.formula || null
      };
      
      if (rateFormData.id) {
        await api.put(`/adult/rates/${rateFormData.id}`, data);
      } else {
        await api.post('/adult/rates', data);
      }
      setShowRateForm(false);
      resetRateForm();
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save rate');
    }
  };

  const handleEditRate = (rate) => {
    setRateFormData({
      id: rate.id,
      each: rate.each || '',
      formula: rate.formula || ''
    });
    setShowRateForm(true);
  };

  const handleDeleteRate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rate?')) return;
    try {
      await api.delete(`/adult/rates/${id}`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete rate');
    }
  };

  const resetRateForm = () => {
    setRateFormData({
      id: null,
      each: '',
      formula: ''
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Chores Management</h2>
      <ToastContainer position="bottom-center" className="p-3">
        <Toast 
          show={!!error} 
          onClose={() => setError('')} 
          bg="danger" 
          autohide 
          delay={5000}
        >
          <Toast.Header>
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{error}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        {/* Chores Tab */}
        <Tab eventKey="chores" title="Chores">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Chores</h3>
            <Button onClick={() => { resetChoreForm(); setShowChoreForm(true); }}>
              + New Chore
            </Button>
          </div>

          <Modal show={showChoreForm} onHide={() => { setShowChoreForm(false); resetChoreForm(); }}>
            <Modal.Header closeButton>
              <Modal.Title>{choreFormData.id ? 'Edit Chore' : 'New Chore'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleChoreSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={choreFormData.name}
                    onChange={(e) => setChoreFormData({ ...choreFormData, name: e.target.value })}
                    required
                    maxLength={100}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={choreFormData.description}
                    onChange={(e) => setChoreFormData({ ...choreFormData, description: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Link</Form.Label>
                  <Form.Control
                    type="url"
                    value={choreFormData.link}
                    onChange={(e) => setChoreFormData({ ...choreFormData, link: e.target.value })}
                    maxLength={256}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Enabled"
                    checked={choreFormData.enabled}
                    onChange={(e) => setChoreFormData({ ...choreFormData, enabled: e.target.checked })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Lifecycle *</Form.Label>
                  <Form.Select
                    value={choreFormData.lifecycleId}
                    onChange={(e) => setChoreFormData({ ...choreFormData, lifecycleId: e.target.value })}
                    required
                  >
                    <option value="">Select a lifecycle</option>
                    {lifecycles.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.infinite ? 'Infinite' : l.daily ? 'Daily' : 'Custom'} - {l.id.substring(0, 8)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Rate *</Form.Label>
                  <Form.Select
                    value={choreFormData.rateId}
                    onChange={(e) => setChoreFormData({ ...choreFormData, rateId: e.target.value })}
                    required
                  >
                    <option value="">Select a rate</option>
                    {rates.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.each ? `$${r.each} each` : r.formula || 'Formula'} - {r.id.substring(0, 8)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Button type="submit" variant="primary">Save</Button>
                <Button type="button" variant="secondary" className="ms-2" onClick={() => { setShowChoreForm(false); resetChoreForm(); }}>
                  Cancel
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {chores.length === 0 ? (
            <Alert variant="info">No chores found. Create your first chore.</Alert>
          ) : (
            <Card>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Link</th>
                      <th>Enabled</th>
                      <th>Lifecycle</th>
                      <th>Rate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chores.map((chore) => (
                      <tr key={chore.id}>
                        <td>{chore.name}</td>
                        <td>{chore.description || '-'}</td>
                        <td>{chore.link ? <a href={chore.link} target="_blank" rel="noopener noreferrer">Link</a> : '-'}</td>
                        <td>{chore.enabled ? 'Yes' : 'No'}</td>
                          
                        <td>{chore.infinite ? 'Infinite' : chore.daily ? 'Daily' : 'Custom'}</td>
                        <td>{chore.each ? `$${chore.each}` : chore.formula || '-'}</td>
                        <td>
                          <Button variant="primary" size="sm" onClick={() => handleToggleEnabledChore(chore)} className="me-2">{chore.enabled ? 'Disable' : 'Enable'}</Button>
                          <Button variant="secondary" size="sm" onClick={() => handleEditChore(chore)} className="me-2">Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteChore(chore.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Tab>

        {/* Lifecycles Tab */}
        <Tab eventKey="lifecycles" title="Lifecycles">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Lifecycles</h3>
            <Button onClick={() => { resetLifecycleForm(); setShowLifecycleForm(true); }}>
              + New Lifecycle
            </Button>
          </div>

          <Modal show={showLifecycleForm} onHide={() => { setShowLifecycleForm(false); resetLifecycleForm(); }}>
            <Modal.Header closeButton>
              <Modal.Title>{lifecycleFormData.id ? 'Edit Lifecycle' : 'New Lifecycle'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleLifecycleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Infinite"
                    checked={lifecycleFormData.infinite}
                    onChange={(e) => setLifecycleFormData({ ...lifecycleFormData, infinite: e.target.checked })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Daily"
                    checked={lifecycleFormData.daily}
                    onChange={(e) => setLifecycleFormData({ ...lifecycleFormData, daily: e.target.checked })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Days of Week Mask</Form.Label>
                  <Form.Control
                    type="number"
                    value={lifecycleFormData.daysOfWeekMask}
                    onChange={(e) => setLifecycleFormData({ ...lifecycleFormData, daysOfWeekMask: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Max Per Day</Form.Label>
                  <Form.Control
                    type="number"
                    value={lifecycleFormData.maxPerDay}
                    onChange={(e) => setLifecycleFormData({ ...lifecycleFormData, maxPerDay: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Max Per Hour</Form.Label>
                  <Form.Control
                    type="number"
                    value={lifecycleFormData.maxPerHour}
                    onChange={(e) => setLifecycleFormData({ ...lifecycleFormData, maxPerHour: e.target.value })}
                  />
                </Form.Group>
                <Button type="submit" variant="primary">Save</Button>
                <Button type="button" variant="secondary" className="ms-2" onClick={() => { setShowLifecycleForm(false); resetLifecycleForm(); }}>
                  Cancel
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {lifecycles.length === 0 ? (
            <Alert variant="info">No lifecycles found. Create your first lifecycle.</Alert>
          ) : (
            <Card>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Infinite</th>
                      <th>Daily</th>
                      <th>Days of Week Mask</th>
                      <th>Max Per Day</th>
                      <th>Max Per Hour</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lifecycles.map((lifecycle) => (
                      <tr key={lifecycle.id}>
                        <td>{lifecycle.infinite ? 'Yes' : 'No'}</td>
                        <td>{lifecycle.daily ? 'Yes' : 'No'}</td>
                        <td>{lifecycle.daysOfWeekMask || '-'}</td>
                        <td>{lifecycle.maxPerDay || '-'}</td>
                        <td>{lifecycle.maxPerHour || '-'}</td>
                        <td>
                          <Button variant="sm" size="sm" onClick={() => handleEditLifecycle(lifecycle)} className="me-2">Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteLifecycle(lifecycle.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Tab>

        {/* Rates Tab */}
        <Tab eventKey="rates" title="Rates">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Rates</h3>
            <Button onClick={() => { resetRateForm(); setShowRateForm(true); }}>
              + New Rate
            </Button>
          </div>

          <Modal show={showRateForm} onHide={() => { setShowRateForm(false); resetRateForm(); }}>
            <Modal.Header closeButton>
              <Modal.Title>{rateFormData.id ? 'Edit Rate' : 'New Rate'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleRateSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Each ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={rateFormData.each}
                    onChange={(e) => setRateFormData({ ...rateFormData, each: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Formula</Form.Label>
                  <Form.Control
                    type="text"
                    value={rateFormData.formula}
                    onChange={(e) => setRateFormData({ ...rateFormData, formula: e.target.value })}
                    maxLength={20}
                  />
                </Form.Group>
                <Button type="submit" variant="primary">Save</Button>
                <Button type="button" variant="secondary" className="ms-2" onClick={() => { setShowRateForm(false); resetRateForm(); }}>
                  Cancel
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {rates.length === 0 ? (
            <Alert variant="info">No rates found. Create your first rate.</Alert>
          ) : (
            <Card>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Each ($)</th>
                      <th>Formula</th>
                      <th>Created On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map((rate) => (
                      <tr key={rate.id}>
                        <td>{rate.each ? `$${rate.each}` : '-'}</td>
                        <td>{rate.formula || '-'}</td>
                        <td>{new Date(rate.createdOn).toLocaleDateString()}</td>
                        <td>
                          <Button variant="sm" size="sm" onClick={() => handleEditRate(rate)} className="me-2">Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteRate(rate.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}

export default Chores;
