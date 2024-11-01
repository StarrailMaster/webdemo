"use client";

import React, { useEffect, useState } from 'react';
import styles from './home.module.css';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sales: number;
  stock: number;
  rating: number;
  clicked: boolean;
}

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tips, setTips] = useState('Search Result Display Here...');
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  useEffect(()=>{
    fetchData();
  }, [router])

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem('userId');

      const response = await axios.post('http://13.55.190.75:8080/api/recommendation/user',
        {
          userId: userId
        },
      );
      console.log(response)
      setSearchResults(
        response.data.recommendedProducts.map((item: any) => ({
          ...item,
          clicked: false,
        }))
      );

    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitBehavior();
    const userId = localStorage.getItem("userId")
    try {
      setTips("Searching...");
      const response = await axios.post('http://13.55.190.75:8080/api/search', {
        keyword: searchTerm,
        userId: userId
      });
      console.log(response.data);
      setSearchResults(
        response.data.map((item: any) => ({
          ...item.product,
          clicked: item.clicked
        }))
      );
      setTips('');    
    } catch (error) {
      console.error('search failure', error);
    }
  };

  const handleProductClick = (productId: number) => {
    setSearchResults((prevResults) =>
      prevResults.map((product) =>
        product.id === productId
          ? { ...product, clicked: true }
          : product
      )
    );
  };

  const handleSubmitBehavior = async () => {
    try {
      await axios.post('http://13.55.190.75:8080/api/behavior/log', 
        searchResults.map(product => ({
          userId: localStorage.getItem("userId"),
          productId: product.id,
          behaviorType: product.clicked ? 'click' : 'nonclick',
          timestamp: new Date().toISOString()
        }))
      );
      console.log('User behavior data submitted successfully');
    } catch (error) {
      console.error('Failed to submit user behavior data', error);
    }
  }; 

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Product Search</h1>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Please Enter Keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>Search</button>
        <button className={styles.aiButton} onClick={() => router.replace('/roleSelection')}>AI Recommend</button>
      </form>
      <div className={styles.resultsContainer}>
        {searchResults.length > 0 ? (
          searchResults.map((product, index) => (
            <div key={index} className={styles.productCard} onClick={()=>handleProductClick(product.id)}>
              <h2 className={styles.productName}>{product.name}</h2>
              <p className={styles.productDescription}>{product.description}</p>
              <p className={styles.productPrice}>Price: ¥{product.price}</p>
              <p className={styles.productSales}>Sales: {product.sales}</p>
              <p className={styles.productStock}>Stocks: {product.stock}</p>
              <p className={styles.productStock}>Rating: {product.rating}</p>
            </div>
          ))
        ) : (
          <p className={styles.placeholder}>{tips}</p>
        )}
      </div>
    </div>
  );
};

export default Home;
