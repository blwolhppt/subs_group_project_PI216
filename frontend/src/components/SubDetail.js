import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate, useParams } from 'react-router-dom';
import './AddSubscription.css';

const SubDetail = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    period: 0,
    categories: [],
    subscription_date: ''
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchCategories();
  }, [id]);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/subscription/${id}/`);
      const subscriptionData = response.data;
      setFormData({
        name: subscriptionData.name,
        price: Number(subscriptionData.price),
        period: Number(subscriptionData.period),
        categories: subscriptionData.categories.map(category => String(category.id)),
        subscription_date: new Date(subscriptionData.subscription_date).toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData(prevState => ({
        ...prevState,
        categories: [...prevState.categories, value.toString()]
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        categories: prevState.categories.filter(category => category !== value.toString())
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      await axios.patch(`http://127.0.0.1:8000/api/subscription/${id}/`, {
        name: formData.name,
        price: formData.price,
        period: formData.period,
        categories: formData.categories.map(category => parseInt(category)),
        subscription_date: formData.subscription_date
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      setDeleted(true);
    } catch (error) {
      setError('Ошибка при редактировании подписки. Пожалуйста, попробуйте снова.');
      console.error('Failed to edit subscription:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      await axios.delete(`http://127.0.0.1:8000/api/subscription/${id}/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      setDeleted(true);
    } catch (error) {
      setError('Ошибка при удалении подписки. Пожалуйста, попробуйте снова.');
      console.error('Failed to delete subscription:', error);
    }
  };

  if (deleted) {
    return <Navigate to="/subscription" />;
  }

  return (
    <div className='form-wrapper'>
      <div className="form-container">
        <span className="visually-hidden">Редактирование подписки</span>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form className="subs-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="name"></label>
        <input className="subscription-title-input" type="text" name="name"
               id="name"  value={formData.name}
               onChange={handleChange}/>


        <label>
            Категории:
            <ul className='categories-data choice'>
            {categories.map(category => (
              <li key={category.id} className='sub-category add'>
                <input
                  className="category-checkbox"
                  type="checkbox"
                  name="categories"
                  value={String(category.id)}
                  checked={formData.categories.includes(String(category.id))}
                  onChange={handleCheckboxChange}
                />
                <span>{category.name}</span>
              </li>
            ))}
            </ul>
          </label>

          <label className="form-label">Цена (в руб.):
            <input className="form-control" type="number" name="price" value={formData.price} onChange={handleChange} />
          </label>
          <label className="form-label">Период (в днях):
            <input className="form-control" type="number" name="period" value={formData.period} onChange={handleChange} />
          </label>
          <label className="form-label">Дата подписки:
            <input className="form-control" type="date" name="subscription_date" value={formData.subscription_date} onChange={handleChange} />
          </label>
          <button className="btn btn-dark submit-button" type="submit">Сохранить изменения</button>
          <button className="btn btn-dark submit-button" type="submit" onClick={handleDelete}>Удалить подписку</button>
        </form>
    </div>
    </div>
  );
};

export default SubDetail;